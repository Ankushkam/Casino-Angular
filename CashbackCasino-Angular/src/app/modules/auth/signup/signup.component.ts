import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { APIS, COUNTRIES_LOCALES, DEFAULT_VALUES, REGEX } from 'src/app/common/constants';
import { REGISTER_STEPS, SIGNUP_STEPS, STEPS } from 'src/app/common/signup';
import { Provinces } from 'src/app/core/mocks/provinces';
import { HttpService, ModalService, SharedService } from 'src/app/core/services';
import { LoginComponent } from '../login/login.component';
import { RegisterService } from '../register/register.service';
import * as moment from 'moment';
import { RegisterModel } from 'src/app/core/models/register.model';
import { CountryISO, PhoneNumberFormat, SearchCountryField } from 'ngx-intl-tel-input';
import { SignupModel } from 'src/app/core/models/signup.model';
import { PayNPlayResolver } from 'src/app/core/services/pay-n-play.resolver';


@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  @ViewChild('date') date: ElementRef;
  @ViewChild('month') month: ElementRef;
  @ViewChild('year') year: ElementRef;


  searchCountry;
  searchCurrency;
  applyCountryFilter: boolean;
  applyCurrencyFilter: boolean
  separateDialCode = true;
  countryISO;
  isPswdValidation = false;
  SearchCountryField = SearchCountryField;
  CountryISO = CountryISO;
  PhoneNumberFormat = PhoneNumberFormat;
  preferredCountries: CountryISO[] = [
    CountryISO.UnitedStates,
    CountryISO.UnitedKingdom
  ];
  SIGNUP_STEPS = SIGNUP_STEPS;
  STEPS = STEPS;
  currentCountry;
  form: FormGroup;
  step = 1;
  signupStep = 1;
  countries;
  currencies;
  currentIP;
  htmlContent = {
    cookiePolicy: { content: "", path: "/cookie-policy" },
    privacypolicy: { content: "", path: "/privacy-policy" },
    termsConditions: { content: "", path: '/terms-and-conditions', }
  };
  mobileView: string = "left";
  mobile: boolean = false;
  stepItems = REGISTER_STEPS;
  openCountry = false;
  hideProvinces = false;
  closeModal = false;
  arrowkeyLocation = 0;
  stepTitle = this.translate.instant('title.login_details');
  maxStep;
  openModal = false;
  showStreets = false;
  isOtherStreet = false;
  show = false;
  hasMinLength = false;
  provinces = Provinces
  registerStatus: string;
  alphabetExists = false;
  digitExists = false;
  specialCharExists = false;
  group = {};
  isSubmit: boolean;
  showContent;
  currentYear = new Date().getFullYear();
  specialCharsVaidation = this.translate.instant('forms.label.special_characters');
  currencyPlaceholder = this.translate.instant('forms.label.select_currency');
  countryPlaceholder = this.translate.instant('forms.label.select_country');
  isContactEdit = false;
  invalidDate = false;
  isEighteen = true;
  postalCodePattern;
  formattedaddress;
  streets;
  openCurrency = false;
  welcomeContent;
  // addressForCountries=['IN','CN','IE','AE','RU'];
  addressForCountries = []
  isPNPAllowed;
  showAddressField: boolean;
  today = new Date();
  formStep1: FormGroup;
  formStep2: FormGroup;
  formStep3: FormGroup;
  formStep4: FormGroup;
  formStep5: FormGroup;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.mobile = (window.innerWidth <= DEFAULT_VALUES.MOBILE_SIZE) ? true : false;
  }
  constructor(
    private sharedService: SharedService,
    private fb: FormBuilder,
    private httpService: HttpService,
    private modalService: ModalService,
    private activeModal: NgbActiveModal,
    private translate: TranslateService,
    private registerService: RegisterService,
    private router: Router,
    private pnpService:PayNPlayResolver
  ) { }

  ngOnInit(): void {


    if (window.innerWidth <= DEFAULT_VALUES.MOBILE_SIZE) { // 768px portrait
      this.mobile = true;
    }
    this.sharedService.currentIP.subscribe((res) => {
      this.currentCountry = res?.country_code;
    });

    // First we get the viewport height and we multiple it by 1% to get a value for a vh unit
    let vh = window.innerHeight * 0.01;
    // Then we set the value in the --vh custom property to the root of the document
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    this.initForm();
    this.sharedService.currentIP.subscribe((res)=>{
      if(res) {
        this.isPNPAllowed=this.pnpService.isCountryAllowed(res.country_code)?true:false;
        this.currentIP=res?.country_code
        // if(this.isPNPAllowed && this.translate.currentLang=='fi'){
        //   this.depositButton=this.translate.instant('text.deposit_and_play');
        this.getData()
        // }
      } else {
        this.sharedService.getCurrentIP();
      }
    })
    // this.getData();
  }

  changePreferredCountries() {
    this.preferredCountries = [CountryISO.India, CountryISO.Canada];
  }

  /** Init Registration Form */
  initForm() {
    this.form = this.buildForm();
    this.formStep1 = this.fb.group({
      email: ['', [Validators.pattern(REGEX.EMAIL), Validators.required]],
      password: ['', [Validators.minLength(DEFAULT_VALUES.PASSWORD_MIN_LENGTH), Validators.pattern(REGEX.PASSWORD), Validators.required]],
      receive_promos: [false, Validators.required],
    }),

      this.formStep2 = this.fb.group({
        country: [this.currentCountry, Validators.required],
        currency: ['', Validators.required],
        contactNo: ['', Validators.required]
      });
    this.formStep3 = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      gender: ['', Validators.required],
      dob: this.fb.group({
        dd: ['', [Validators.required, Validators.maxLength(2), Validators.min(1), Validators.max(31)]],
        mm: ['', [Validators.required, Validators.maxLength(2), Validators.max(12), Validators.min(1)]],
        yy: ['', [Validators.required, Validators.maxLength(4), Validators.minLength(4), Validators.min(new Date().getFullYear() - 150), Validators.max(new Date().getFullYear() - 18)]]
        // dob: new FormControl(null, youngerThanValidator(100))
      })
    });
    this.formStep4 = this.fb.group({
      city: ['', Validators.required],
      address: ['', Validators.required],
      postalCode: ['', Validators.required]
    });
    this.formStep5 = this.fb.group({
      termsAcceptance: [false, Validators.required],
      ageTermsAcceptance: [false, Validators.required]
    })
  }

  next() {
    this.step = this.step + 1;
  }

  inputValue(event: any) {
    if (this.formStep3.value.dob.dd?.length == 2) {
      this.month.nativeElement.focus();
    } else {
      this.date.nativeElement.focus();
    }

  }

  inputMonth(event: any) {
    if (this.formStep3.value.dob.mm?.length == 2) {
      this.year.nativeElement.focus();
    } else {
      this.month.nativeElement.focus();
    }

  }

  /** Function for toggle cuntry dropdown */
  toggleCountry() {
    if (this.openCurrency) {
      this.toggleCurrency();
    }
    this.openCountry = !this.openCountry;
    let item = document.getElementById('country');
    // let openCurrency = document.getElementById('currency');
    // if (openCurrency.classList.length == 2) {
    //   this.openCurrency = !this.openCurrency;
    //   openCurrency.classList.remove('select_open')
    // }
    item.classList.toggle('select_open')
  }

  /** Function for toggle currency dropdown */
  toggleCurrency() {
    if (this.openCountry) {
      this.toggleCountry();
    }
    this.openCurrency = !this.openCurrency;
    let item = document.getElementById('currency');
    // let openCountry = document.getElementById('country');
    // if (openCountry.classList.length == 2) {
    //   this.openCurrency = !this.openCurrency;
    //   openCountry.classList.remove('select_open');
    // }
    item.classList.toggle('select_open')
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

  getData() {
    let restrictedCountries=['CZ','GR','RS','SY','CU','KP','IR'];
    // To Fetch countries list
    this.httpService.getData(APIS.COUNTRY_LIST).subscribe((res) => {
      this.countries = res.body.filter((country)=>{return !restrictedCountries.includes(country.code)});
      // console.log("================countries=====>",this.countries)
      this.currentCountry = this.countries.find((country) => { return country?.code == this.currentCountry });
      this.searchCountry = this.currentCountry.name;
      this.countryISO = CountryISO[this.currentCountry?.name]
    });
    this.sharedService.isCurrenciesUpdated.subscribe((res) => {
      this.currencies = [...this.sharedService.allCurrencies];
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
    this.sharedService.snippets.subscribe(res => {
      let data=JSON.parse(res.find(snippet => snippet.id == "home-banner")?.content);
      this.welcomeContent=data[this.router.url.replace('/','')] || data[this.translate.currentLang];
      if(this.isPNPAllowed && this.currentIP=='FI'){
        this.welcomeContent=data['pnp'];
        }
        if(this.isPNPAllowed && this.currentIP=='SE' && this.translate.currentLang=='en'){
          this.welcomeContent=data['en-en'];
          }
    });
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
   * It only allows alphabets on key events
   * @param event 
   */
  alphabetFilter(event, field) {
    this.controls3[field].setValue(this.controls3[field].value.replace(/  +/g, ' '))
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
    let pattern = REGEX.CONTACT_NUMBER
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

  doNotRemember() {
    this.form?.get('postalCode').clearValidators();
    this.form?.get('postalCode').updateValueAndValidity();
    this.nextStep(this.step);
  }

  /**
   * On selecting province
   * @param province 
   */
  selectProvince(province) {
    // this.hideProvinces = !this.hideProvinces;
    this.controls.province.setValue(province);
  }

  /**
   * Takes to the Contact Number Field for Edit
   */
  editContact() {
  }

  get controls() {
    return this.formStep1?.controls;
  }

  get dobControls() {
    return this.formStep3['controls']['dob']['controls'];
  }

  get controls2() {
    return this.formStep2?.controls;
  }
  get controls3() {
    return this.formStep3?.controls;
  }
  get controls4() {
    return this.formStep4?.controls;
  }

  get controls5() {
    return this.formStep5?.controls;
  }

  /**
   * Redirects to the login
   */
  gotoLogin() {
    this.activeModal.close();
    this.modalService.openModal(LoginComponent);
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

  nextStep(value) {

  }

  /**
 * Generate authentication code
 */
  getCode() {
    //TODO: Generate code on submitting contact no
  }

  /**
   * On selecting value for terms and conditions
   * @param value 
   */
  termsAcceptance(value) {
    this.controls5.termsAcceptance.setValue(value);
    this.controls5.ageTermsAcceptance.setValue(value);
  }

  /**
   * On Selecting value for recieve sms/promos
   * @param value 
   */
  sendSms(value) {
    this.controls.receive_promos.setValue(value.target.checked);
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
      date = moment(string, "DD/MM/YY").format("YY/MM/DD h:mm:ss A");
    } else {
      date = moment(string, "DD/MM/YYYY").format("YYYY/MM/DD h:mm:ss A");
    }
    if (date !== "Invalid date") {
      this.invalidDate = false;
      let minDOB = new Date();
      let maxDOB = new Date();
      let today = new Date();
      minDOB.setFullYear(minDOB.getFullYear() - 18);
      maxDOB.setFullYear(maxDOB.getFullYear() - 150);
      // console.log("hn",minDOB.getFullYear())
      let myDOB = new Date(date);
      // console.log("today",today);
      // console.log("myDOB",myDOB);                   
      if (myDOB < minDOB && myDOB >= maxDOB) {
        myDOB.setFullYear(myDOB.getFullYear() - 150);
        // console.log("fjdefjeif")
      } else {
        this.invalidDate = true;
        // console.warn("Must be a valid date and you must be 18 years or older.");
      }

    }
  }
  stepClass(step, limit?) {
    if (!limit) {
      return this.step > step ? 'completed step-completed' : (this.step == step) ? 'next disabled' : 'disabled'
    }
    return this.step > limit ? 'completed step-completed' : (this.step >= step) && this.step <= limit ? 'next disabled' : 'disabled'
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
      if (group.get("password").value == group.get("email").value) {
        return { passwordMatching: true };
      }
    }

    return null;
  }
  /** On submit registration form Event handler */
  onSubmit() {
    this.isSubmit = true;
    if (this.form.invalid) {
      return
    }
    let data = new RegisterModel(this.form.value, this.formattedaddress, moment);
    let data2 = this.removeEmpty(data);
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
    let finalObj = {};
    Object.keys(obj).forEach((key) => {
      if (obj[key] && typeof obj[key] === 'object' && key !== "date_of_birth") {
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
    string = string.replace(':', ' ');
    string = string.replace('_', ' ');
    // this.alertService.error(this.capitalizeFirstLetter(string.toLowerCase()));
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


  onBackspaceKeydown(event: any, control, prevref) {
    let key = event.keyCode || event.charCode;
    if (key == 8 || key == 46) {
      if ((control == 'mm' && !this.dobControls.mm.value) || (control == 'yy' && !this.dobControls.yy.value)) {
        prevref.focus();
      }
    }
  }

  back(step?) {
    this.step = this.step - 1
  }

  selectStreet(street) {
    this.controls.street.setValue(street)
    this.showStreets = !this.showStreets;
  }

  enterStreetName() {
    this.controls.street.setValue('')
    this.showStreets = !this.showStreets;
    this.isOtherStreet = true;
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
      const value = (event.target.value);
      const length = value.length;

      // Handling year input
      if (control == 'yy') {
        if (!pattern.test(inputChar) || length >= maxlength) {
          event.preventDefault();
        }
        if (length == minlength || length == maxlength) {
          this.validateYear(value, this.getTwoDigitNumber(this.dobControls.mm.value), this.getTwoDigitNumber(this.dobControls.dd.value), length);
        }
      } else {
        if (!pattern.test(inputChar) || +value > maxValue || (value) == '00' || value.length >= maxlength) {
          event.preventDefault();
          if (+value > maxValue || value == '00') {
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

      if (length + 1 == maxlength) {
        if (nextref) {
          this.form.get('dob').get(nextControl).enable();
          nextref.focus();
        }
      }
    }
  };

  capitalizeFirstLetter(string) {
    return (string[0].toUpperCase() + string.slice(1));
  }

  updateLanguage(lang): void {
    let src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBSEevlEGahCcyEuhnGWpIJqQ5uNX-9Zus&libraries=places&language=${lang.slice(0, 2)}`;
    // this.scriptService.load({ name: "googleApi", src: src, loaded: false, id:'googleApi' }).subscribe(scriptData => {
    // });
  }

  submitStep1() {
    if (this.formStep1.invalid) {
      return;
    }
    let data = new SignupModel({...this.formStep1.value});
    // console.log(data)
    let data2 = this.removeEmpty(data);
    this.httpService.postData(APIS.REGISTRATION, data2).subscribe(res => {
      // this.registerStatus = "success";
      this.next();
    }, err => {
      console.error(err);
      if (((err || {}).email || {}).taken || (((err || {}).profile || {}).first_name || {}).taken || (((err || {}).profile || {}).last_name || {}).taken || (((err || {}).profile || {}).date_of_birth || {}).taken) {
        this.registerStatus = "alreadyTaken",
          this.nextStep(this.step);
      } else {
        // this.getErrors(err)
        this.next();
      }
    });
    // console.log(this.formStep1.value);
    // this.next();
  }

  submitStep2() {
    if (this.formStep2.invalid) {
      return;
    }
    // console.log(this.formStep2.value);
    this.next();
  }

  submitStep3() {
    if (this.formStep3.invalid) {

      return;
    }
    // console.log(this.formStep3.value);
    this.next();
  }
  submitStep4() {
    if (this.formStep4.invalid) {
      return;
    }
    // console.log(this.formStep4.value);
    this.next();
  }


  submitSignup() {
    this.isSubmit = true;
    if (this.formStep5.invalid) {
      return
    }
    let data = { ...this.formStep1.value, ...this.formStep2.value, ...this.formStep3.value, ...this.formStep4.value, ...this.formStep5.value }
    data['country'] = this.countries.find((c) => { return c.name == data['country'] });
    data = new SignupModel(data);
    // console.log(data)
    let data2 = this.removeEmpty(data);
    this.httpService.postData(APIS.REGISTRATION, data2).subscribe(res => {
      this.registerStatus = "success";
      this.next();
    }, err => {
      console.error(err);
      if (((err || {}).email || {}).taken || (((err || {}).profile || {}).first_name || {}).taken || (((err || {}).profile || {}).last_name || {}).taken || (((err || {}).profile || {}).date_of_birth || {}).taken) {
        this.registerStatus = "alreadyTaken",
          this.nextStep(this.step);
      } else {
        this.getErrors(err)
      }
    });

  }
  /**
   * On Selecting country
   * @param country 
   */
  selectCountry(country) {
    // this.openCountry = !this.openCountry;
    this.toggleCountry();
    this.formStep2.controls.country.setValue(country.name);
    this.applyCountryFilter = false;
    this.currentCountry = this.countries.find((count) => { return count?.code == country.code });
      this.searchCountry = this.currentCountry.name;
      this.countryISO = CountryISO[this.currentCountry?.name]
  }

  selectCurrency(currency) {
    // this.hideProvinces = !this.hideProvinces;
    this.controls2.currency.setValue(currency);
    // this.openCurrency = !this.openCurrency;
    this.toggleCurrency();
    this.applyCurrencyFilter = false;

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

}

