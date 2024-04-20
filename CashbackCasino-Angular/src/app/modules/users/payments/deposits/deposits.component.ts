import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertService, HttpService, AuthService, ModalService, SharedService } from 'src/app/core/services';
import { Router } from '@angular/router';
import { APIS, URLS, MESSAGES, FORM_VALIDATION, DISCARDED_PAYMENT_METHODS, REGEX, PAYMENT_CUSTOM_ROUTES, TRANSACTION_TYPES, SORT_PAYMENT_METHODS, ONLY_ALLOWED_PAYMENT_PROVIDERS } from 'src/app/common/constants';
import { Payment_Methods } from 'src/app/core/mocks/payment-methods';
import { forkJoin } from 'rxjs';
import { MyProfileComponent } from '../../my-profile/my-profile.component';
import { environment } from 'src/environments/environment';
import * as _ from 'lodash';
import { ScriptLoaderService } from 'src/app/core/services/script.service';
import { TranslateService } from '@ngx-translate/core';
import { IframeComponent } from 'src/app/modules/shared/iframe/iframe.component';
import { UserService } from 'src/app/core/services/user.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-deposits',
  templateUrl: './deposits.component.html',
  styleUrls: ['./deposits.component.scss']
})
export class DepositsComponent implements OnInit {
  form: FormGroup;
  depositForm:FormGroup;
  methodData;
  providers=[];
  step;
  depositAmount;
  isDeposits;
  show: Boolean = false;
  closeModal: Boolean = false;
  currency;
  paymentMethods:any = [];
  recentUsedMethods = [];
  successMessage;
  selectedMethod;
  bonusTypes=[];
  title;
  allCurrencies=[];
  playerData;
  hideBonuses;
  hideCashbackBonuses;
  statusData;
  group={};
  invalidAmount = false;
  encryptionScript;
  invalidAmountMessage;
  currentYear;
  selectedMethodFields=[]
  discardedMethods=DISCARDED_PAYMENT_METHODS;
  promocode;
  promocodeFlag = false;
  promocodeMsg;
  isPromoChecking:boolean=false;

  STEPS={
    AMOUNT:1,
    PAYMENT_METHODS:2,
    PAYMENT_DETAILS:3,
    STATUS:4,
    REDIRECT:5
  }
  cryptoPaymentMethods:any=[]
  range = (start, stop, step) => Array.from({ length: (stop - start) / step + 1}, (_, i) => start + (i * step));
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private httpService: HttpService,
    private router: Router,
    private activeModal: NgbActiveModal,
    private alertService:AlertService,
    private ngModal:NgbModal,
    private scriptService:ScriptLoaderService,
    private translate:TranslateService,
    private modalService:ModalService,
    private userService:UserService,
    private headerService:HeaderService,
    private sharedService:SharedService,
    private sanitizer:DomSanitizer
  ) { 
    this.errorHandler=this.errorHandler.bind(this);
  }

  ngOnInit(): void {
    this.sharedService.isHideBonuses.subscribe((res)=>{
        this.hideBonuses=res;
    })
    this.sharedService.isHideCashbackBonus.subscribe((res)=>{
      this.hideCashbackBonuses=res;
    })
    if (this.statusData) {
      this.step = this.STEPS.STATUS;
      return;
    } else {
      this.step=this.STEPS.AMOUNT;
    }
    this.currency = this.authService.getUserData('currency') || 'EUR';
    this.initForm();
    this.getAPIData();
  }
  /** -- function to initialize the form */
  initForm() {
    this.form = this.formBuilder.group({
      amount: ['', [Validators.required]],
      currency:[this.currency]
    });
  }

  getExpiryYear(method){
    let range=[];
    // if (!method.show_full_year) {
    //   this.currentYear = +(new Date().getFullYear().toString().substr(-2));
    // } else {
    //   this.currentYear = +(new Date().getFullYear())
    // }
    // let range = this.range(this.currentYear, this.currentYear + 15, 1);
    for(let i=0;i<=10;i++) {
      range.push(+(new Date().getFullYear()+i))
    }
    return range;

  }

  promocodeCheck() {
    var data = { "deposit_bonus_code": this.promocode }

      this.httpService.patchData(`${APIS.PLAYER.SET_DEPOSIT_BONUS_CODE}`, data).subscribe((couponDetails: any) => {
        this.promocodeFlag=true;
      }, this.errorHandler);

  }

  removePromo(){
    this.httpService.deleteData(`${APIS.PLAYER.REMOVE_DEPOSIT_BONUS_CODE}`).subscribe((res: any) => {
      this.promocodeFlag=false;
      this.promocode=''
    }, this.errorHandler);
  }

  getAPIData() {
    let apiCalls = [
      this.httpService.getData(`${APIS.PAYMENTS.PAYMENT_METHODS}/${this.currency}`),
      this.httpService.getData(APIS.PLAYER.DATA),
      this.httpService.getData(APIS.PAYMENTS.PAYMENT_ACCOUNTS, { kind: TRANSACTION_TYPES.DEPOSIT }),
      this.httpService.getData(APIS.USER_LIMITS),
      // this.httpService.getData(APIS.CURRENCIES)
    ]

    forkJoin(apiCalls).subscribe((res) => {
      this.authService.updateUserDetails((res[1] || {}).body)
      this.paymentMethods = ((res[0] || {}).body || {}).methods || Payment_Methods.methods;
      
      this.providers=((res[0] || {}).body || {}).providers;
      this.getAvailableMethods(this.providers);

      this.playerData = (res[1] || {}).body;
      this.promocode=this.playerData?.deposit_bonus_code;
      if(this.promocode){
        this.promocodeFlag=true;
      }
      // this.recentUsedMethods = (res[2] || {}).body;
      // this.allCurrencies=(res[4] || {}).body;
      this.sharedService.isCurrenciesUpdated.subscribe((res)=>{
        this.allCurrencies=this.sharedService.allCurrencies;
    })
    });

    // this.httpService.getData(APIS.PLAYER.DEPOSIT_BONUSES).subscribe((res) => {
    //   this.bonusTypes = (res || {}).body;
    // });
  }

  stepSkip() {
    if(this.step==1 && this.methodData) {
      this.checkDepositMethodFields(this.methodData);
    } else {
    this.step++;
    }

  }

  getTranslatedText(text) {
    return this.translate.instant(text);

  }


  async getAvailableMethods(providers) {
    let filteredMethods = [...this.paymentMethods];
    this.getMethodConfigs(providers,filteredMethods).then((res)=>{
      let bank = this.paymentMethods.findIndex((method) => {
        return method.brand == 'bank';
      });
      if (bank > -1) {
        this.paymentMethods.splice(bank, 1)
      }
      this.paymentMethods = this.paymentMethods.filter((method) => {
        if (method.brand == 'creditcard' && this.userService.country == 'NO') {
          return false;
        } else {
          return method.deposit && method.deposit_form_fields && _.find(providers, { provider: method.provider }) && _.find(providers, { provider: method.provider }) && !_.find(this.discardedMethods, { brand: method.brand, provider: method.provider }) && (['sofort', 'ideal', 'trustly', 'interac'].includes(method.brand) ? ONLY_ALLOWED_PAYMENT_PROVIDERS[method.brand]?.includes(this.userService.country) : true);
        }
  
        // return method.deposit && !_.find(this.discardedMethods, { brand: method.brand, provider: method.provider });;
      });
      this.sortMethods(this.paymentMethods);
      this.paymentMethods=this.paymentMethods.concat(this.cryptoPaymentMethods);
      this.paymentMethods=this.paymentMethods.filter((method) => {
        let loaded=true;
        if(method?.deposit_form_fields?.loaded==false){
          loaded=false
        }
        return loaded;
      });
    })

  }

  getMethodConfigs(providers,filteredMethods){
    return new Promise((resolve,reject)=>{
      let isFiltered=false;
      providers.forEach(async (provider,index) => {
        if (provider?.config?.available_deposits_url) {
          this.paymentMethods=await this.getPaymentConfigs(provider,filteredMethods);
          isFiltered=true;
          if(this.cryptoPaymentMethods.length>0  && providers.length>1){
            resolve(true)
          }else if(providers.length==1){
            resolve(true)
          }
          
        }
        else {
          this.cryptoPaymentMethods=await this.getCryptoMethods(provider);
          if(isFiltered  && providers.length>1){
            resolve(true)
          } else if(providers.length==1){
            resolve(true)
          }
        } 
      });
     
    })
  }

  getPaymentConfigs(provider,filteredMethods){
    return new Promise((resolve,reject)=>{
      this.httpService.get(provider?.config?.available_deposits_url).subscribe((res: any) => {
        if (res?.methods) {
          res.methods.forEach(method => {
            if (method?.service) {
              let brandIndex = this.paymentMethods.findIndex((el) => { return el.brand.toLowerCase() == method?.providerType.toLowerCase() })
              if (brandIndex > -1) {
                let pymentmethod = Object.assign({}, this.paymentMethods[brandIndex]);
                pymentmethod.brand = method?.service.toLowerCase();
                pymentmethod['service'] = method?.service;
                if (filteredMethods[brandIndex].brand == this.paymentMethods[brandIndex].brand) {
                  filteredMethods.splice(brandIndex, 1)
                }
                filteredMethods.push(pymentmethod);
              }
            }
          })
          resolve([...filteredMethods]);
        }
      })
    })
  }

  getCryptoMethods(provider){
    return new Promise((resolve,reject)=>{
      let methods = provider?.methods;
      let apiCalls = [];
      let keys = Object.keys(provider?.config);
      keys.forEach((key) => {
        let req = this.httpService.postData(`${APIS.PAYMENTS.PAYMENT_METHODS}/${this.currency}/${methods[0]}/deposit_info`, { currency: key })
        apiCalls.push(req)
      });
      forkJoin(apiCalls).subscribe(results => {
        // console.log(results)
        // this.cryptoPaymentMethods = [...results]
        resolve(results);

      });
    })
  }
  sanitize(url:string){
    return this.sanitizer.bypassSecurityTrustUrl(url);
}


  /**
   * Checks if the amount is valid for selected method and send data for initiate payment processing
   * @param method 
   */
  checkDepositMethodFields(method) {
    if (this.controls.amount.value >= (+method.deposit.min) && this.controls.amount.value <= (+method.deposit.max)) {
      this.invalidAmountMessage = '';
      this.invalidAmount = false;
    if(method) {
      this.initPaymentProcessing(method);
    }
  } else {
    if(method.brand=='coinspaid'){
      this.initPaymentProcessing(method);
      return;
    }
    this.invalidAmount = true;
    if (this.controls.amount.value < (+method.deposit.min)) {
      this.invalidAmountMessage = this.translate.instant(FORM_VALIDATION.AMOUNT_LESS_THAN_REQUIRED);
    }
    if (this.controls.amount.value > (+method.deposit.max)) {
      this.invalidAmountMessage = this.translate.instant(FORM_VALIDATION.AMOUNT_EXCEEDING_LIMIT);
    }
  }
  }

    /**
   * Checks for other required fields for the selected method and moves to next step
   * @param method 
   */
  initPaymentProcessing(method) {
    if(this.selectedMethodFields.length>0){
      this.selectedMethodFields.forEach((item)=>{
        this.depositForm.removeControl(item?.field);
      })
      }
    this.selectedMethod=method;
    if(this.selectedMethod?.service){
      this.selectedMethodFields = this.filterFields(method?.deposit_form_fields.fields,this.selectedMethod?.service);
    } else{
    this.selectedMethodFields = this.filterFields(method?.deposit_form_fields.fields);
    }
    this.depositForm=this.buildForm(this.selectedMethodFields);
    if(this.selectedMethodFields.length>=1) {
      this.step=this.STEPS.PAYMENT_DETAILS;
    } else {
      this.processPayment(this.form.value);
    }
  }


/**
 * Submitting form
 */
  submit() {
    let data = {...this.depositForm.value};
    data['amount']=parseFloat(data.amount).toFixed(2).toString()
    let depositfields = this.selectedMethod?.deposit_form_fields;
    if (depositfields?.config) {
      if (depositfields?.config?.additional_params) {
        data = { ...data,...depositfields?.config?.additional_params, custom_routes: PAYMENT_CUSTOM_ROUTES };
      }
      if (depositfields?.config?.encrypt_attributes) {
        this.scriptService.load({ name: "encryption", src: depositfields?.config?.encryption_script_url, loaded: false }).subscribe(scriptData => {
          depositfields?.config?.encrypt_attributes.forEach(element => {
            data[element] = window['encryptData'](data[element]) || data[element];
            if (depositfields?.config?.process_url) {  
              this.processPaymentWithURL(data,depositfields?.config?.process_url);
            } else {
              this.processPayment(data);
            }
          });
        })
      } else {
        if (depositfields?.config?.process_url) {
          this.processPaymentWithURL(data,depositfields?.config?.process_url);
        } else {
          this.processPayment(data);
        }
      }
    } else {
      this.processPayment(data);
    }
} 

/**
 * Process payment request if process url is given
 * @param data 
 * @param url 
 */
  processPaymentWithURL(data, url) {
    data = { ...data, attributes: { paymentMethodId: this.selectedMethod.id, custom_routes: PAYMENT_CUSTOM_ROUTES } };
    if(this.selectedMethod.service)   {
        data['service']=this.selectedMethod.service;
      }
    this.httpService.post(url, data).subscribe((res) => {
      if (res['txState'] == 'FAILED') {
        this.errorHandler(res['errors'])
      }
      if (res['txState'] == 'WAITING_INPUT') {
        if (res['redirectOutput']) {
          if (res['redirectOutput']['url']) {

            if (res['redirectOutput']['method'] == 'GET') {

              this.generateForm(res['redirectOutput']['url'], res['redirectOutput']['parameters'], res['redirectOutput']['method'],res['redirectOutput']['container'])
              // window.top.location.href = res['redirectOutput']['url']
            }
            if (res['redirectOutput']['method'] == 'POST') {


              this.generateForm(res['redirectOutput']['url'], res['redirectOutput']['parameters'], res['redirectOutput']['method'],res['redirectOutput']['container'])
            }
          }else if(res['redirectOutput']['html']){
            let form = document.createElement('form');
            form.method = res['redirectOutput']['html']; // Set method to post by default if not specified.
            form.className='form'
            form.target = 'hidden-iframe'
            this.modalService.openModal(IframeComponent, {html:res['redirectOutput']['html'],container:res['redirectOutput']['container'],form:form})
          }
        } 
      }
      if(res['txState']=='SUCCESS') {
        this.addGtagScript();
        this.modalService.openModal(MyProfileComponent,{goToHistory:true});
       }
    }, this.errorHandler)
  }



  generateForm(path, params, method,container) {
    let form = document.createElement('form');
    form.method = method || "post"; // Set method to post by default if not specified.
    form.action = path;
    form.className='form'
    form.target = '_self'
    if(container=='page-redirect'){
      form.enctype="multipart/form-data"
    }

    for (let key in params) {
      if (params.hasOwnProperty(key)) {
        let input = document.createElement('input');
        input.name = key;
        input.value = params[key]
        form.appendChild(input);
      }
    }
    if(method=='POST') {
      this.modalService.openModal(IframeComponent, {src:path, form:form,container:container})
    }
    else {
      document.body.appendChild(form);
      window.top.location.href = path
      // this.modalService.openModal(IframeComponent, {src:path, form:form,submit:true})
    }
    // document.body.appendChild(form);
  }

  getIframe(src,mode, height?, width?) {
    if(mode=='redirect'){
    let iframe = document.createElement('iframe');
    iframe.name = "hidden-iframe"
    iframe.className = "iframe"
    iframe.src = src;
    iframe.height = '100%';
    iframe.width = "100%";
    document.getElementById('iframe-container').appendChild(iframe)
    }
  }

  addGtagScript() {
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + environment.gtagKey;
    document.head.prepend(script);
  }

/**
 * Process payment with payment API
 * @param data 
 */
processPayment(data) {
  data = { ...data, payment_method: this.selectedMethod.id, custom_routes: PAYMENT_CUSTOM_ROUTES, currency: this.currency, payment_action: TRANSACTION_TYPES.DEPOSIT };
  this.httpService.postData(`${APIS.PAYMENTS.PAYMENT_PROCESSING}`, data).subscribe((paymentDetails: any) => {
    this.initPayment(paymentDetails);
  }, this.errorHandler);
}

/**
 * Initiates payment after getting data submission response
 * @param paymentData 
 */
initPayment(paymentData) {
  this.headerService.fetchData();
  this.headerService.isUpdateAccount.next(true)
  switch(paymentData.mode) {
    case 'notify': 
    this.title="Processing";
    this.successMessage=this.getMessages(MESSAGES.SUCCESS.REQUEST_ACCEPTED);
    this.step=this.STEPS.STATUS;
      break;

    case 'redirect':
      // window.location.href = paymentData.url;
      // this.generateForm(paymentData?.url ,{params:paymentData?.options?.data?.params},'POST','redirect')
      this.step=this.STEPS.REDIRECT;
      this.getIframe(paymentData?.url ,'redirect')
      break;

    case 'page_redirect':
      // let formData = new FormData();
      // formData.append("params", paymentData.options.data.params);
      // this.generateForm(paymentData.options.url ,{params:paymentData.options.data.params},paymentData.options.data.method,'page-redirect')
      this.modalService.openModal(IframeComponent, {src:paymentData.options.url, params:paymentData.options.data,container:'page-redirect'})
      break;

      case 'form_redirect':
        this.modalService.openModal(IframeComponent, { src: paymentData?.options?.url, params: paymentData.options.data, container: 'form_redirect' })
        break;
  }
  
}


/**
 * Filtering deposit method form fields data
 * @param fields 
 */
  filterFields(fields,service?){ 
    let fieldsArray=[];
    fields.forEach(field => {
      let isFieldAllowed=true;
      if(field?.services?.only?.length>0 || field?.services?.except?.length>0){
        let isServiceAllowed=true;
        if(field?.services?.only?.length>0){
          if(service){
            isServiceAllowed=field?.services?.only.forEach(res => { return res.toUpperCase() === service.toUpperCase(); });
          } else {
            isServiceAllowed=false;
          }
        } else if(field?.services?.only?.length>0){
          if(service){
          isServiceAllowed=field?.services?.except.forEach(res => { return res.toUpperCase() === service.toUpperCase(); });
          isServiceAllowed=!isServiceAllowed
          } else {
            isServiceAllowed=true;
          }
        }
        if(isServiceAllowed){
          isFieldAllowed=true;
        }
        else{
          isFieldAllowed=false;
        }
      }
      if(isFieldAllowed){
      let value={};
      value['field']=field.field;
      value['value']=field?.value || '';
      if(field?.html_content) {
        fieldsArray.push(field);
      } else {
      switch(field.field) {
        case 'amount':
          value['label']="Amount"
          value['type']="number";
          value['step']=field.step;
          value['validations']= {min:field?.min || null, max:field?.max || null};
          value['value']= this.form.controls.amount.value || field?.value || '';
          break;
        case 'email':
          value['label']="Email"
          value['type']="text";
          value['validations']={pattern: REGEX.EMAIL}
          break;
        case 'account':
            value['label'] = field?.label || "Email"
            value['type'] = "text";
            value['validations'] = { pattern: REGEX.EMAIL }
            break;
        case 'NeoSurfEmail':
            value['label'] = field?.label || "Email"
            value['type'] = "text";
            value['validations'] = { pattern: REGEX.EMAIL }
            break;
        case 'service':
          value['label']=field?.label || "Bank Services"
          value['type']='select';
          value['placeholder']="Select your bank"
          // value['validations']={required:true};
          value['options']=field?.options;
          break;
        case 'account_type':
          value['label'] = field?.label || "Account type"
          value['type'] = 'select';
          value['placeholder']="Select type"
          // value['validations']={required:true};
          value['options'] = field?.options;
          break;
        case 'phoneNumber':
          value['label'] = field?.label || "Phone Number"
          value['type'] = 'text',
            value['validations'] = {
              pattern: REGEX.ONLY_DIGITS,
              maxLength: 16,
              minLength: 5
            };
          break;
        case 'phone':
          value['label'] = field?.label || "Phone Number"
          value['type'] = 'text',
            value['validations'] = {
              pattern: REGEX.ONLY_DIGITS,
              maxLength: 16,
              minLength: 5
            };
          break;
        case 'encCreditcardNumber':
          value['label']=field?.label || "Card Number"
          value['type']=field.type,
          value['validations']={
            required: true,
          }
          break;
        case 'cardHolder':
          value['label']=field?.label || "Card Holder"
          value['type']=field.type,
          value['validations']={
            required: true,
          }
          break;
        case 'expiry_date':
          value['label'] = field?.label || "Expiry Date"
          value['type'] = field.type,
            value['validations'] = {
              required: true,
            }
          value['month'] = field.month_field;
          value['year'] = field.year_field
          value['show_full_year'] = field.show_full_year
          break;
        case 'country_and_bank':
          value['label'] = "Country and Bank"
          value['type'] = field.type,
            value['validations'] = {
              required: true,
            }
          value['country'] = field.primary,
            value['bank_code'] = field.secondary
          if (field?.values) {
            value['values'] = field?.values;
          }
          break;
        case 'cvv':
          value['label']=field?.label || "CVV"
          value['type']='cvv';
          value['validations']={
            minLength: 3,
            required: true,
          }
          break;
        case 'address':
          if (field?.type == 'crypto_address') {
            value['app_path'] = field?.app_path
            value['currency'] = field?.currency
            value['placeholder'] = field?.placeholder
            value['type'] = field?.type
          }
          break;
          default:
            value['label']=field?.label || field?.field
            value['type'] = field.type;
            if(field?.options){
              value['options'] = field?.options;
            }
            value['validations'] = {
            required: true
          }
      }
      fieldsArray.push(value);
    }
  }
    });
    return fieldsArray;
  }

  /**
   * Builds dynamic form with fields data
   * @param fields 
   */
  buildForm(fields) {
    if (fields) {
      fields.forEach((item, i) => {
        if(item.field) {
          if(item.field=='expiry_date') {
            this.group[item.month] = new FormControl('', this.getValidators(item.validations));
            this.group[item.year] = new FormControl('', this.getValidators(item.validations));
            // let subgroup={};
            // subgroup[item.month] = new FormControl('', this.getValidators(item.validations));
            // subgroup[item.year] = new FormControl('', this.getValidators(item.validations));
            // this.group[item.field]=new FormGroup(subgroup)
          } else if(item.field == 'country_and_bank'){
            this.group[item.country] = new FormControl('', this.getValidators(item.validations));
            this.group[item.bank_code] = new FormControl('', this.getValidators(item.validations));
          } else {
            this.group[item.field] = new FormControl(item?.value|| '', this.getValidators(item.validations));
          }
        }
      })
      return new FormGroup(this.group)
    }
  }


  onCountrySelected(event){
    console.log(event);

  }

  getBankCodes(event,arr){
    console.log(event)
    let codes=arr.find(country=>{ return country.value==event});
    return codes?.list
  }

    /**
   * Get validations for form control
   * @param validations 
   */
  getValidators(validations: any) {
    if(validations) {
      const fieldValidators = Object.keys(validations).map((validator) => {
        if (validator == 'required' || validator == 'email') {
          return Validators[validator];
        } else {
          return Validators[validator](validations[validator]);
        }
      });
      return fieldValidators;
    }
    return;
  
  }

  close(value?) {
    this.activeModal.close();
  }

  get controls() {
    return this.form.controls;
  }

  /**
   * Get logo image url for payment methods
   * @param method 
   */
  getUrl(method,i?) {
    switch(method.brand) {
      case 'bank':
      //   return `${environment.imgBaseURL}${URLS.PAYMENT_LOGO}/${method.provider}-sofort.svg`;
      case 'skrillqco':
        return `${environment.imgBaseURL}${URLS.PAYMENT_LOGO}/${method.provider}-skrill.svg`;
      return ''
      case 'coinspaid':
        return `${environment.imgBaseURL}${URLS.PAYMENT_LOGO}/${this.paymentMethods[i]?.deposit_form_fields?.config?.original_currency}_${method.brand}.svg`;
      case 'webredirect':
        return `${environment.imgBaseURL}${URLS.PAYMENT_LOGO}/${method.provider}-sticpay.svg`;
      default:
        if(method.brand!==method.provider)
        return `${environment.imgBaseURL}${URLS.PAYMENT_LOGO}/${method.provider}-${method.brand}.svg`;
        else
        return `${environment.imgBaseURL}${URLS.PAYMENT_LOGO}/${method.provider}.svg`;
    }
  }

  getTwoDigitNumber(d) {
    return (+d < 10 && d.length == 1 ? '0' : '') + String(d);
  }

  get formControls() { return this.form.controls; }

  // /**
  //  * 
  //  * @param bonus 
  //  */
  // getMaxAmount(bonus) {
  //   let obj=bonus.bonuses[0].attributes[0].value.default.find(value => {
  //     return value.currency==this.currency;
  //   });
  //   if(obj) {
  //     return obj.amount_cents;
  //   }
  //   return bonus.bonuses[0].attributes[0].value.default[0]?.amount_cents;
  // }

  // getValue(bonus) {
  //   if(this.playerData){
  //   let status = (this.playerData || {}).statuses.find(status => {
  //     return status.id == bonus.bonuses[0].conditions[0].value[0]
  //   });
  //   if (status) {
  //     return true;
  //   }
  // }
  //   return false;
  // }

  // updateBonuses(event, bonus) {
  //   let groups = {};
  //   if (event.target.checked) {
  //     if (((this.playerData || {}).statuses || {}).length > 0) {
  //       groups['remove'] = [];
  //       groups['remove'].push(((this.playerData || {}).statuses[0] || {}).id);
  //     }
  //     groups['add'] = [];
  //     groups['add'].push(bonus.bonuses[0].conditions[0].value[0]);
  //   } else {
  //     groups['remove'] = [];
  //     groups['remove'].push(bonus.bonuses[0].conditions[0].value[0]);
  //   }
  //   this.httpService.postData(APIS.PLAYER.GROUPS, { groups: groups }).subscribe((res) => {
  //     this.httpService.getData(APIS.PLAYER.DATA).subscribe((res) => {
  //       this.playerData = (res || {}).body;
  //     });
  //   },this.errorHandler);
  // }

  getName(name,method) {
    switch(name) {
      // case 'bank':
      //   return 'Sofort';
      case 'online_bank_transfer':
        if(method.provider=='skrill'){
        return 'Skrill Rapid Transfer'
        } else {
          return name.split('_').join(" ");
        }
        case 'mifinity':
        return 'MiFinity'
      default:
        return name.split('_').join(" ");
    }
  }

  sortMethods(methods) {
    // this.httpService.getData(APIS.CURRENT_IP).subscribe((res) => {
      let modifiedArray = [];
      let ip = this.userService.country;
      let sortData = SORT_PAYMENT_METHODS[ip];
      if (sortData) {
        sortData.forEach(element => {
          let index = methods.findIndex(el => {
            return el.brand == element;
          })
          if (index > -1) {
            modifiedArray.push(methods[index]);
          }
        });
        methods.forEach(element => {
          let index = modifiedArray.findIndex((item) => { return item.brand == element.brand });
          if (index < 0) {
            modifiedArray.push(element)
          }
        });
        this.paymentMethods = [...modifiedArray]
      }
      // //to append sofort method on top
      // let index=this.paymentMethods.findIndex((el) => el.brand === "redirect_deposit");
      // if(index > -1){
      //   let temp=this.paymentMethods[0];
      //   this.paymentMethods[0]=this.paymentMethods[index];
      //   this.paymentMethods[index]=temp;
      // }
    // })
  }


  goTo(path) {
    this.router.navigate([path]);
    this.activeModal.close()
  }

  back() {
    this.invalidAmount = false;
    this.step--;
  }

  myProfile() {
    let profileModal=this.ngModal.open(MyProfileComponent, {
      size: 'lg',
      centered: true,
      backdrop: 'static',
      keyboard: false,
    });
    profileModal.componentInstance.goToDeposits=true;
  }

  getMessages(message){
    return this.translate.instant(message);
  }
 

  errorHandler(error) {
    let errors=Object.keys(error);
    errors.forEach(key => {
      let titles=Object.keys(error[key]);
      titles.forEach((err)=>{
        // this.alertService.error(`${+key || +key==0?'':key} ${(error[key][err])}`);
        this.alertService.error((error[key][err]));
      })
    });
  }

}
