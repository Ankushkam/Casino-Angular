/// <reference types="@types/googlemaps" />
import { Component, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { HttpService } from 'src/app/core/services/http.service';
import { APIS, REGEX, DEFAULT_VALUES, COUNTRIES_LOCALES } from '../../../common/constants';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Provinces } from 'src/app/core/mocks/provinces';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { RegisterModel } from 'src/app/core/models/register.model';
import { AlertService, ModalService, SharedService } from 'src/app/core/services';
import * as moment from 'moment';
import { Router } from '@angular/router';
import { REGISTER_STEPS, STEPS } from 'src/app/common/signup';
import { RegisterService } from './register.service';
import { LoginComponent } from '../login/login.component';
import { TranslateService } from '@ngx-translate/core';
import { GooglePlaceDirective } from 'ngx-google-places-autocomplete';
import { ScriptLoaderService } from 'src/app/core/services/script.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  @ViewChild('nextButton') nextButton: ElementRef;
  @ViewChild('inputParent') inputParent: ElementRef;
  @ViewChild('input') inputs: ElementRef;
  @ViewChild('helper') helpers: ElementRef;
  @ViewChild("placesRef") placesRef : GooglePlaceDirective;
  step = -1;
  STEPS = STEPS;
  arrowkeyLocation = 0;
  stepTitle = this.translate.instant('title.sign_up_to_praise_casino');
  maxStep;
  openModal = false;
  showStreets=false;
  isOtherStreet=false;
  openCountry = false;
  hideProvinces = false;
  show = false;
  hasMinLength = false;
  provinces = Provinces
  registerStatus: string;
  closeModal = false;
  alphabetExists = false;
  digitExists = false;
  specialCharExists = false;
  group = {};
  isSubmit: boolean;
  form: FormGroup;
  countries = [];
  currencies = [];
  currentCountry;
  showContent;
  currentYear = new Date().getFullYear();
  stepItems = REGISTER_STEPS;
  specialCharsVaidation = this.translate.instant('forms.label.special_characters');
  currencyPlaceholder = this.translate.instant('forms.label.select_currency');
  countryPlaceholder = this.translate.instant('forms.label.select_country');
  isContactEdit = false;
  invalidDate = false;
  isEighteen = true;
  postalCodePattern;
  // addressForCountries=['IN','CN','IE','AE','RU'];
  addressForCountries=[]
  showAddressField:boolean;
  htmlContent = {
    cookiePolicy: { content: "", path: "/cookie-policy" },
    privacypolicy: { content: "", path: "/privacy-policy" },
    termsConditions: { content: "", path: '/terms-and-conditions', }
  };
  mobileView: string = "left";
  mobile: boolean = false;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.mobile = (window.innerWidth <= DEFAULT_VALUES.MOBILE_SIZE) ? true : false;
  }
  options={ 
    language:localStorage.getItem('locale'),
    // region:'',
    types:['geocode'],
    componentRestrictions:{
      country:[]
    } 
  } 
  streets;
  formattedaddress;
  constructor(
    private httpService: HttpService,
    private fb: FormBuilder,
    private activeModal: NgbActiveModal,
    private alertService: AlertService,
    private modalService: ModalService,
    private router: Router,
    private registerService: RegisterService,
    private translate: TranslateService,
    private sharedService:SharedService,
    private scriptService:ScriptLoaderService
  ) { }

  ngOnInit(): void {
    if (window.innerWidth <= DEFAULT_VALUES.MOBILE_SIZE) { // 768px portrait
      this.mobile = true;
    }
    this.sharedService.currentIP.subscribe((res)=>{
      this.currentCountry=res?.country_code;
      this.options.componentRestrictions.country=[this.currentCountry];
      this.updateLanguage(COUNTRIES_LOCALES[this.currentCountry] || 'en');
    });

    // First we get the viewport height and we multiple it by 1% to get a value for a vh unit
    let vh = window.innerHeight * 0.01;
    // Then we set the value in the --vh custom property to the root of the document
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    this.initForm();
    this.getData();
  }

  enterStreetName() {
    this.controls.street.setValue('')
    this.showStreets=!this.showStreets;
    this.isOtherStreet=true;
  }

  getAddressInfoByPostalCode(postal) {
    if(postal.length>=5 && typeof google !='undefined') {
      let geoCoder= new google.maps.Geocoder();
      geoCoder.geocode({ 'componentRestrictions':{ 'postalCode': postal ,'country':this.controls.country.value.code}, region: this.controls.country.value.code }, (results,status)=>{
        if(status==google.maps.GeocoderStatus.OK) {
          if(results.length>=1) {
            results.forEach((address,i) => {
              for (let component in address['address_components']) {
                for (let i in address['address_components'][component]['types']) {
                    if (address['address_components'][component]['types'][i] == "locality" || address['address_components'][component]['types'][i] == "postal_town") {
                        let city = address['address_components'][component]['long_name'];
                        this.controls.city.setValue(city);
                    }
                }
            } 

              geoCoder.geocode({location:address.geometry.location},(result1,status1)=>{
                if(status1==google.maps.GeocoderStatus.OK) {
                this.streets=result1;
                }
              })

            });
          }
        }

      })
    }

  }

  selectStreet(street) {
    this.controls.street.setValue(street)
    this.showStreets=!this.showStreets;
  }

  /**
   * APIs to Get Data for Registration form
   */
  getData() {
    // To Fetch countries list
    this.httpService.getData(APIS.COUNTRY_LIST).subscribe((res) => {
      this.countries = res.body;
    });
    this.sharedService.isCurrenciesUpdated.subscribe((res)=>{
        this.currencies=[...this.sharedService.allCurrencies];
    })
    // if(!this.currencies) {
    //   this.httpService.getData(APIS.CURRENCIES).subscribe((res) => {
    //     this.currencies = res.body;
    //   });
    // } 

    let pages = Object.keys(this.htmlContent);
    pages.forEach(page => {
      this.getCMSPageData(this.htmlContent[page].path, page);
    })
  }

  /** Init Registration Form */
  initForm() {
    this.form = this.buildForm();
    this.form.disable();
    this.nextStep(this.step);
  }

  /**
   * Create form dynamically with validators
   */
  buildForm() {
    this.stepItems.forEach((item, i) => {
      item.data.forEach(element => {
        this.group[element.name] = new FormControl('', this.getValidators(element.validations));
      });
    })
    this.group['dob'] = this.fb.group({
      'dd': ['', [Validators.required, Validators.maxLength(2), Validators.min(1), Validators.max(31)]],
      'mm': ['', [Validators.required, Validators.maxLength(2), Validators.max(12), Validators.min(1)]],
      'yy': ['', [Validators.required, Validators.maxLength(2), Validators.minLength(2)]]
    });
    return new FormGroup(this.group)
  }

  /**
   * It only allows alphabets on key events
   * @param event 
   */
  alphabetFilter(event) {
    this.controls.name.setValue(this.controls.name.value.replace(/  +/g, ' '))
    const pattern = REGEX.FULL_NAME;
    const inputChar = String.fromCharCode(event.charCode);
    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  /**
   * It only allows numbers on key events
   * @param event
   */

  numberOnly(event) {
    const charCode = (event.which) ? event.which : event.keyCode;
    let pattern=REGEX.CONTACT_NUMBER
    // if (charCode > 31 && (charCode < 48 || charCode > 57)) {
    //   return false;
    // }
    // return true;
    const inputChar = String.fromCharCode(event.charCode);
    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  navigateCountry(event) {
    if (this.step == STEPS.COUNTRY_AND_POSTAL && this.openCountry) {
      if (!this.openCountry) {
        this.openCountry = !this.openCountry
      } else {
        switch (event.keyCode) {
          case 38: // this is the ascii of arrow up
            this.arrowkeyLocation--;
            break;
          case 40: // this is the ascii of arrow down
            this.arrowkeyLocation++;
            break;
        }
      }
    }
  }

  postalcodeFilter(event) {
    if (this.controls.country.value) {
      let pattern = new RegExp(this.registerService.getRegexForPostalCode(this.controls.country.value));
      const inputChar = String.fromCharCode(event.charCode);
      if (!pattern.test(inputChar)) {
        event.preventDefault();
      }
    }
  }

  /**
   * Get validations for form control
   * @param validations 
   */
  getValidators(validations: any) {
    const fieldValidators = Object.keys(validations).map((validator) => {
      if (validator == 'required' || validator == 'email') {
        return Validators[validator];
      } else {
        return Validators[validator](validations[validator]);
      }
    });
    return fieldValidators;
  }

  /** On submit registration form Event handler */
  onSubmit() {
    this.isSubmit = true;
    if (this.form.invalid) {
      return
    }
    let data = new RegisterModel(this.form.value,this.formattedaddress,moment);
    let data2=this.removeEmpty(data);
    this.httpService.postData(APIS.REGISTRATION, data2).subscribe(res => {
      this.registerStatus = "success";
      this.nextStep(this.step);
    }, err => {
      console.error(err);
      if (((err || {}).email || {}).taken || (((err || {}).profile || {}).first_name || {}).taken || (((err || {}).profile || {}).last_name || {}).taken || (((err || {}).profile || {}).date_of_birth || {}).taken) {
        this.registerStatus = "alreadyTaken",
          this.nextStep(this.step);
      } else {
        this.getErrors(err)
      }
    })
  }


  removeEmpty(obj) {
    let finalObj={};
    Object.keys(obj).forEach((key) => {
        if (obj[key] && typeof obj[key] === 'object' && key!=="date_of_birth") {
            const nestedObj = this.removeEmpty(obj[key]);
            if (Object.keys(nestedObj).length) {
                finalObj[key] = nestedObj;
            }
        } else if (obj[key] !== '' && obj[key] !== undefined && obj[key] !== null) {
            finalObj[key] = obj[key];
        }
    });
    return finalObj;
}

  updateLanguage(lang): void {
    let src= `https://maps.googleapis.com/maps/api/js?key=AIzaSyBSEevlEGahCcyEuhnGWpIJqQ5uNX-9Zus&libraries=places&language=${lang.slice(0,2)}`;
    this.scriptService.load({ name: "googleApi", src: src, loaded: false, id:'googleApi' }).subscribe(scriptData => {
    });
  }

  AddressChange(address:any) {
    // this.placesRef.options.componentRestrictions.country='JA'
    for (let component in address['address_components']) {
      for (let i in address['address_components'][component]['types']) {
          if (address['address_components'][component]['types'][i] == "locality" || address['address_components'][component]['types'][i] == "postal_town") {
              let city = address['address_components'][component]['long_name'];
              this.controls.city.setValue(city);
              break;
          }
      }
    }
    // let input:HTMLInputElement = document.getElementById('autocomplete');
    // let autocomplete_location = new google.maps.places.Autocomplete(input);
    // autocomplete_location.setComponentRestrictions({'country': country.code});
    this.formattedaddress=address.formatted_address;
    // this.controls.postalCode.setValue(address.formatted_address);
  }


  getErrorString(errors, obj) {
    let string = '';
    errors.forEach(field => {
      let errNames = Object.keys(obj[field]);
      errNames.forEach(err => {
        string = string + `${field}: ${(obj[field][err])}\n`
      });
    });
    return string;
  }

  /**
   * Handler for API error response
   */
  getErrors(obj) {
    let string = '';
    let errors = [];
    let profileErrors = [];
    errors = Object.keys(obj);
    errors = errors.filter(e => e !== 'profile');
    if (obj['profile']) {
      profileErrors = Object.keys(obj['profile']);
    }
    string = this.getErrorString(errors, obj);
    if (obj['profile']) {
      string = string + `${this.getErrorString(profileErrors, obj['profile'])}`
    }
    string=string.replace(':',' ');
    string=string.replace('_',' ');
    this.alertService.error(this.capitalizeFirstLetter(string.toLowerCase()));
  }

  capitalizeFirstLetter(string) {
    return (string[0].toUpperCase() + string.slice(1));
  }

  /**
   * On Selecting country
   * @param country 
   */
  selectCountry(country) {
    this.updateLanguage(COUNTRIES_LOCALES[country.code] || 'en');
    this.controls.postalCode.setValue('');
    this.controls.street.setValue('');
    this.form.get('street').disable();
    this.controls.city.setValue('');
    this.form.get('city').disable();
    this.streets=[];
    this.controls.country.setValue(country);
    this.formattedaddress="";
    this.options.componentRestrictions.country=country.code;
    // this.options.region=country.code;
    this.showAddressField=this.addressForCountries.find((res)=>{
      return res==country.code;
    })?true:false;
    this.openCountry = !this.openCountry;
    if(this.showAddressField) {
      this.form.controls.postalCode.clearValidators();
      this.form.get('postalCode').updateValueAndValidity();
    }
    if(!this.showAddressField){
      // this.postalCodePattern = new RegExp(this.registerService.getRegexForPostalCode(country));
      // this.form.controls.postalCode.setValidators([Validators.pattern(this.postalCodePattern), Validators.required])
      this.form.controls.postalCode.setValidators([Validators.required])
      this.form.get('postalCode').updateValueAndValidity();
      }
  }

  doNotRemember() {
    this.form.get('postalCode').clearValidators();
    this.form.get('postalCode').updateValueAndValidity();
    this.nextStep(this.step);
  }

  /**
   * On selecting province
   * @param province 
   */
  selectProvince(province) {
    this.hideProvinces = !this.hideProvinces;
    this.controls.province.setValue(province);
    this.focusInput();
  }

  selectCurrency(currency) {
    this.hideProvinces = !this.hideProvinces;
    this.controls.currency.setValue(currency);
    this.focusInput();
  }

  /**
   * Takes to the Contact Number Field for Edit
   */
  editContact() {
    this.step = 3;
    this.isContactEdit = true;
  }

  get controls() {
    return this.form.controls;
  }

  get dobControls() {
    return this.form['controls']['dob']['controls'];
  }

  /**
   * Generate authentication code
   */
  getCode() {
    this.moveNext(this.step);
    //TODO: Generate code on submitting contact no
    setTimeout(() => { this.moveNext(this.step) }, 5000);
  }

  /**
   * On selecting value for terms and conditions
   * @param value 
   */
  termsAcceptance(value) {
    this.controls.termsAcceptance.setValue(value);
    this.controls.ageTermsAcceptance.setValue(value);
    this.moveNext(this.step);
  }

  /**
   * On Selecting value for recieve sms/promos
   * @param value 
   */
  sendSms(value) {
    this.controls.recieveSmsPromos.setValue(value);
    this.moveNext(this.step);
  }

  /**
   * Custom validator for validating date and age based on entered date
   * @param year 
   * @param month 
   * @param day 
   * @param digits 
   */
  validateYear(year, month, day, digits) {
    let date;
    let string = `${day}/${month}/${year}`;
    if (digits == 2) {
      date = moment(string, "DD/MM/YY").format("YYYY/MM/DD h:mm:ss A");
    } else {
      date = moment(string, "DD/MM/YYYY").format("YYYY/MM/DD h:mm:ss A");
    }
    if (date !== "Invalid date") {
      this.invalidDate = false;
      let minDOB = new Date();
      let today = new Date();
      minDOB.setFullYear(minDOB.getFullYear() - 18);
      let myDOB = new Date(date);
      if (today < myDOB) {
        myDOB.setFullYear(myDOB.getFullYear() - 100);
      }
      this.isEighteen = (minDOB >= myDOB)

    } else {
      this.invalidDate = true;
    }
  }

  stepClass(step, startLimit) {
    return this.step > step ? 'completed step-completed' : (this.step <= step && this.step > startLimit) ? 'next disabled' : 'disabled'
  }

  stepMove(step) {
    if (this.mobile && step < this.step) {
      this.back(step);
      this.mobileView = "right";
    }
    else if (this.mobile && step <= this.step) {
      this.mobileView = "right";
      this.step = step;
    }
    return;
  }

  checkShowCase(side) {
    if (this.mobile) {
      if (this.mobileView == side) {
        return true
      }
      else {
        return false;
      }
    }
    else {
      return true;
    }
  }

  onBackspaceKeydown(event: any, control, prevref) {
    let key = event.keyCode || event.charCode;
    if (key == 8 || key == 46) {
      if ((control == 'mm' && !this.dobControls.mm.value) || (control == 'yy' && !this.dobControls.yy.value)) {
        prevref.focus();
      }
    }
  }

  /**
   * Custom filter for DOB validations
   * @param event 
   * @param maxlength 
   * @param minlength 
   * @param control 
   * @param nextref 
   * @param maxValue 
   */
  dateInputFilter(event: any, maxlength?, minlength?, control?, nextref?, maxValue?, nextControl?) {
    const pattern = /^[\d./-]*$/;
    const inputChar = String.fromCharCode(event.keyCode || event.charCode);
    if (!pattern.test(inputChar)) {
      event.preventDefault();
      return;
    } else {
      const value = ((event.target.value) + (inputChar));
      const length = value.length;

      // Handling year input
      if (control == 'yy') {
        if (!pattern.test(inputChar) || length > maxlength) {
          event.preventDefault();
        }
        if (length == minlength || length == maxlength) {
          this.validateYear(value, this.getTwoDigitNumber(this.dobControls.mm.value), this.getTwoDigitNumber(this.dobControls.dd.value), length);
        }
      } else {
        if (!pattern.test(inputChar) || +value > maxValue || (value)=='00' || value.length>maxlength) {
          event.preventDefault();
          if (+value > maxValue || value=='00') {
            if (length <= maxlength) {
              this.dobControls[control].setValue(this.getTwoDigitNumber(value));
              this.invalidDate = true;
              return
            }
          }
        } else {
          this.invalidDate = false;
        }
        // if (this.form.controls['dob'].valid && this.dobControls.yy.value) {
        if (this.dobControls.yy.value) {
          let year = this.dobControls.yy.value;
          let yearLength = String(this.dobControls.yy.value).length;
          if (yearLength == 1) {
            year = this.getTwoDigitNumber(year);
            yearLength = 2;
          }
          if (control == 'dd' && this.dobControls.mm.valid) {
            this.validateYear(year, this.getTwoDigitNumber(this.dobControls.mm.value), value, yearLength);
          }
          if (control == 'mm' && this.dobControls.dd.valid) {
            this.validateYear(year, value, this.getTwoDigitNumber(this.dobControls.dd.value), yearLength);
          }
        }
      }
      // if (length == maxlength) {
      //   if (nextref) {
      //     this.form.get('dob').get(nextControl).enable();
      //     nextref.focus();
      //   }
      // }
    }
  };

  /**
   * TODO: To handle code verification
   */

  validateCode() {
    this.onSubmit();
  }

  /**
   *  Returns 2 digit number by appending 0 at starting to single digit number
   * @param d 
   */
  getTwoDigitNumber(d) {
    return (d < 10 && d.length == 1 ? '0' : '') + String(d);
  }

  /**
   * Password should not be identical to email
   * @param group 
   */
  passwordMatchValidator(group: FormGroup): any {
    if (group) {
      if (group.get("password").value ==group.get("email").value) {
        return { passwordMatching : true };
      }
    }
   
    return null;
  }

  /**
   * On moving to next step
   * @param prevStep 
   */
  nextStep(prevStep) {
    let pac=document.querySelector('.pac-container')?.remove();
    this.isOtherStreet=false;
    // To set password-email matching validaor on password field
    if(prevStep==STEPS.EMAIL) {
      this.form.setValidators(this.passwordMatchValidator);
      this.form.updateValueAndValidity();
    }
    if(prevStep==STEPS.COUNTRY_AND_POSTAL){
      if(!this.showAddressField){
      this.controls.street.setValue('');
      this.controls.city.setValue('');
      this.form.get('street').disable();
      this.form.get('city').disable();
      this.getAddressInfoByPostalCode(this.controls.postalCode.value);
      }
    }
    if (prevStep == -1 || this.form.valid) {
      let btnClass, inputClass, helperClass;
      helperClass = 'd-none'
      inputClass = 'wait-text'
      if (this.mobile) {
        btnClass = 'save_btn'
      } else {
        btnClass = 'check_save_btn'
      }
      if (this.step == -1) {
        this.moveNext(prevStep)
        // this.step = STEPS.SUCCESS;
        // this.registerStatus = 'success'
      } else {
        if (this.nextButton) {
          this.nextButton.nativeElement.classList.add(btnClass);
          if (this.inputParent) {
            this.inputParent.nativeElement.classList.add(inputClass);
          }
          if (this.helpers) {
            this.helpers.nativeElement.classList.add(helperClass)
          }
          setTimeout(() => {
            this.nextButton.nativeElement.classList.remove(btnClass)
            if (this.inputParent) {
              this.inputParent.nativeElement.classList.remove(inputClass);
            }
            if (this.helpers) {
              this.helpers.nativeElement.classList.remove(helperClass)
            }
            this.moveNext(prevStep);

          }, 100);   //2000
        } else {
          this.moveNext(prevStep);
        }
      }
    }
  }

  moveNext(prevStep) {
    this.changeTitle(prevStep);
    if (this.isContactEdit) {
      this.step = STEPS.GET_PHONE_VERIFICATION_CODE;
      this.isContactEdit = false;
      return;
    }
    // if ([STEPS.EMAIL, STEPS.PHONE_NUMBER, STEPS.GET_PHONE_VERIFICATION_CODE].includes(prevStep)) {
      if ([STEPS.EMAIL, STEPS.PHONE_NUMBER].includes(prevStep)) {
      if (this.mobile) this.mobileView = 'left';
    }
    this.step = prevStep + 1;
    if (this.step == 8) {
      this.step++;
    }
    this.maxStep = this.step;

    // Enabling next step
    let formStep = this.stepItems.find((obj) => {
      return obj.step == this.step;
    })
    if (formStep) {
      formStep.data.forEach(element => {
        this.form.get(element.name).enable();
      });
    }
    if (this.step == STEPS.DOB) {
      // this.form.get('dob').enable();
      this.form.get('dob').get('dd').enable();
    }
    if(this.step==STEPS.COUNTRY_AND_POSTAL) {
      // this.form.controls.country.setValue(this.countries.find((country)=>{return country.code==this.currentCountry}));
      this.openCountry=!this.openCountry;
      this.selectCountry(this.countries.find((country)=>{return country.code==this.currentCountry}))
    }
  }

  focusInput() {
    this.inputs.nativeElement.focus();
  }

  getCountryCode() {
    let code=this.registerService.getCountryCode(this.controls.country.value)
    if(!this.controls.phoneNumber.value.includes(code)){
    return this.registerService.getCountryCode(this.controls.country.value);
    }
    return '';
  }

  changeTitle(prevStep) {
    if (prevStep == STEPS.EMAIL) {
      this.stepTitle = this.translate.instant('title.start_with_email')
    }
    if (prevStep == STEPS.PASSWORD) {
      this.stepTitle = this.translate.instant('title.set_logins')
    }
    if (prevStep == STEPS.PHONE_NUMBER) {
      this.stepTitle = this.translate.instant('title.confirm_details')
    }
  }

  /**
   * To move to some previous step
   * @param givenStep 
   */
  goToStep(givenStep) {
    if (this.form.invalid) {
      return;
    }
    if ((givenStep + 1) < this.maxStep) {
      this.step = givenStep + 1;
    }
  }

  /**
   * To go to the previous step
   */
  back(step?) {
    let pac=document.querySelector('.pac-container')?.remove();
    if (this.step == STEPS.DOB) {
      if (this.form.get('dob').invalid || !this.isEighteen || this.invalidDate) {
        this.form.get('dob').reset()
        this.form.get('dob').disable();
        this.isEighteen=true;
        this.invalidDate=false
      }

    } else {
      let formStep = this.stepItems.find((obj) => {
        return obj.step == this.step;
      });
      if (formStep) {
        formStep.data.forEach(element => {
          if (this.form.get(element.name).invalid) {
            this.form.get(element.name).disable();
          }
        });
      }
    }

    if (this.step == 9) {
      this.step = this.step - 1;
    }
    this.step = step ? step : this.step - 1;
  }

  /**
   * TODO: On resend code for verification
   */
  resendCode() {
    this.alertService.success("Code succesfully sent to your contact number");
  }

  /**
   * Close Signup Modal
   * @param value 
   */
  close(value?) {
    if (value == 'yes') {
      if (this.router.url.includes('signup')) {
        this.router.navigate(['/']);
      }
      this.activeModal.close();
    }
    else {
      this.closeModal = !this.closeModal
    }
  }

  /**
   * Password validations
   * @param event 
   */
  checkPasswordValidation(event) {
    const alphabet = REGEX.CONTAIN_ONE_ALPHABET;
    const digit = REGEX.CONTAIN_ONE_DIGIT;
    const specialChar = REGEX.CONTAIN_ONE_SPECIAL_CHAR;
    const strvalue = event;
    const length = strvalue.length;

    if (length >= 8) {
      this.hasMinLength = true;
    } else {
      this.hasMinLength = false;
    }
    if (alphabet.exec(strvalue)) {
      this.alphabetExists = true;
    } else {
      this.alphabetExists = false;
    }
    if (digit.exec(strvalue)) {
      this.digitExists = true;
    } else {
      this.digitExists = false;
    }
    if (specialChar.exec(strvalue)) {
      this.specialCharExists = true;
    } else {
      this.specialCharExists = false;
    }
  }

  getCMSPageData(path, key) {
    let pagePath = APIS.CMS.PAGES + path;
    this.httpService.getData(pagePath).subscribe((resp) => {
      // this.data = resp.body;
      this.htmlContent[key].content = resp?.body?.content;
    });
  }

  getTranslatedText(text) {
    return this.translate.instant(text);

  }
  

  /**
   * Redirects to the login
   */
  gotoLogin() {
    this.activeModal.close();
    this.modalService.openModal(LoginComponent);
  }

  onPasswordStrengthChanged(score) {
    // console.log('new score', score);
  }

}
