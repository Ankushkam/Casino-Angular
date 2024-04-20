import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertService, HttpService, AuthService, SharedService, ModalService } from 'src/app/core/services';
import { Router } from '@angular/router';
import { APIS, URLS, MESSAGES, FORM_VALIDATION, DISCARDED_PAYMENT_METHODS, REGEX, PAYMENT_CUSTOM_ROUTES, TRANSACTION_TYPES, PROMOTION_BONUSES_TYPE, WEEKDAYS, USER_DETAILS, SORT_PAYMENT_METHODS, ONLY_ALLOWED_PAYMENT_PROVIDERS, BONUS_PROMOS } from 'src/app/common/constants';
import { Payment_Methods } from 'src/app/core/mocks/payment-methods';
import { forkJoin } from 'rxjs';
import { environment } from 'src/environments/environment';
import * as _ from 'lodash';
import { ScriptLoaderService } from 'src/app/core/services/script.service';
import { TranslateService } from '@ngx-translate/core';
import { HeaderService } from '../../../../core/services/header.service';
import '../../../../components/promotions/promotions.component.scss';
import { IframeComponent } from 'src/app/modules/shared/iframe/iframe.component';
import { UserService } from 'src/app/core/services/user.service';
import { MyProfileComponent } from '../../my-profile/my-profile.component';
import { RestrictionsService } from 'src/app/core/services/restrictions.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-walletdeposit',
  templateUrl: './walletdeposit.component.html',
  styleUrls: ['./walletdeposit.component.scss']
})
export class WalletdepositComponent implements OnInit {

  form: FormGroup;
  depositForm: FormGroup= new FormGroup({});;
  methodData;
  step;
  depositAmount;
  isDeposits;
  isPromoChecking:boolean=false;
  show: Boolean = false;
  closeModal: Boolean = false;
  currency;
  paymentMethods:any = [];
  recentUsedMethods = [];
  successMessage;
  selectedMethod;
  bonusTypes = [];
  providers=[];
  title;
  allCurrencies = [];
  playerData;
  statusData;
  group = {};
  invalidAmount = false;
  encryptionScript;
  invalidAmountMessage;
  currentYear;
  selectedMethodFields = []
  discardedMethods = DISCARDED_PAYMENT_METHODS;
  STEPS = {
    AMOUNT: 1,
    PAYMENT_METHODS: 2,
    PAYMENT_DETAILS: 3,
    STATUS: 4,
    REDIRECT:5
  }
  range = (start, stop, step) => Array.from({ length: (stop - start) / step + 1 }, (_, i) => start + (i * step));

  show25 = true;
  show50 = false;
  show100 = false;
  show200 = false;
  show500 = false;
  depositSum;
  selectedPaymentMethod;
  methodClicked = false;

  @Input() balanceData;
  @Input() selectedCurrency;
  dropDownCurrency;
  balance = 0;
  amount;
  useBonuses;
  selectedMethodIndex = -1;
  promocode;
  promocodeFlag = false;
  promocodeMsg;
  coinspaidMethods=[];
  // selectedCurrency;

  isRecieveBonuses:boolean;
  hideBonuses;
  hideCashbackBonuses;
  page = "deposit";
  filteredSlides = [];
  slides: any = [];
  depositsCount = 0;
  bonusTypes1 = PROMOTION_BONUSES_TYPE;
  activeBonusType = PROMOTION_BONUSES_TYPE.STANDARD;
  displayBonusType;
  cryptoPaymentMethods:any=[];

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private httpService: HttpService,
    private router: Router,
    private activeModal: NgbActiveModal,
    private alertService: AlertService,
    private scriptService: ScriptLoaderService,
    private translate: TranslateService,
    private sharedService: SharedService,
    private headerService: HeaderService,
    private modalService:ModalService,
    private userService:UserService,
    private restrictionService:RestrictionsService,
    private sanitizer:DomSanitizer
  ) {
    this.errorHandler = this.errorHandler.bind(this);
  }

  ngOnInit(): void {
    this.sharedService.isHideBonuses.subscribe((res)=>{
      this.hideBonuses=res;
  });
  this.sharedService.isHideCashbackBonus.subscribe((res)=>{
    this.hideCashbackBonuses=res;
  })
    if (this.statusData) {
      this.step = this.STEPS.STATUS;
      return;
    } else {
      this.step = this.STEPS.AMOUNT;
    }
    this.currency = this.authService.getUserData('currency') || 'EUR';
    this.dropDownCurrency = []
    this.useBonuses = false;
    // this.amount = this.balanceData[0].amount_cents
    this.promocodeFlag = false;
    this.show25 = true;
    this.depositSum = 25;
    this.methodClicked = false;

    this.initForm();
    this.getAPIData();
    this.getData();

    this.headerService.headerData.subscribe((res) => {
      if (res) {
        this.dropDownCurrency=[];
        if (res.currencies) {
          this.allCurrencies = res.currencies;
        }

        this.balanceData = res.playerAccounts;
        this.currency = this.authService.getUserData(USER_DETAILS.Currency);
        for (var i = 0; i < this.balanceData.length; i++) {
          if ((this.currency == this.balanceData[i].currency)) {
            this.balance = this.balanceData[i].amount_cents;
            this.currency = this.balanceData[i].currency;
            // this.form.patchValue({ balanceAmount: this.balanceData[i].amount_cents })
            this.form.patchValue({ currency: this.balanceData[i].currency })
            this.transformBalance(this.balanceData[i].amount_cents, this.currency);
          }
          this.dropDownCurrency.push(this.balanceData[i].currency);
        }
        this.dropDownCurrency=this.dropDownCurrency.filter((item) => !this.restrictionService.currencies.includes(item));
      }
    });
  }
  /** -- function to initialize the form */
  initForm() {
    this.form = this.formBuilder.group({
      // amount: ['', [Validators.required]],
      // currency: [this.currency[0]],
      balanceAmount: [this.balance, [Validators.required]],
      currency: [this.currency],
      amount: [this.depositSum, [Validators.required]]
    });

    // this.depositForm.patchValue({ amount: this.depositSum })
  }


  transformBalance(value, currency) {
    if (this.allCurrencies) {
      let currencyData = this.allCurrencies.find((obj) => {
        // console.log("obj.code==currency: ", obj.code == currency)
        return obj.code == currency;
      });
      // console.log("currencyData", currencyData)
      // console.log("currencyData?: ", currencyData ? (+value) / (+currencyData.subunits_to_unit) : value)
      // return currencyData?(+this.balanceData[i].amount_cents)/(+currencyData.subunits_to_unit): this.balanceData[i].amount_cents;

      this.form.patchValue({ balanceAmount: currencyData ? (+value) / (+currencyData.subunits_to_unit) : value })
    }
  }

  getExpiryYear(method) {
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

  getAPIData() {
    let apiCalls = [
      this.httpService.getData(`${APIS.PAYMENTS.PAYMENT_METHODS}/${this.currency}`),
      this.httpService.getData(APIS.PLAYER.DATA),
      this.httpService.getData(APIS.PAYMENTS.PAYMENT_ACCOUNTS, { kind: TRANSACTION_TYPES.DEPOSIT }),
      this.httpService.getData(APIS.USER_LIMITS),
      // this.httpService.getData(APIS.CURRENCIES)
    ]

    forkJoin(apiCalls).subscribe((res) => {

      this.paymentMethods = ((res[0] || {}).body || {}).methods || Payment_Methods.methods;
      this.paymentMethods = this.paymentMethods.filter((method) => {
        return method.deposit && method.deposit_form_fields
      });
      this.providers=((res[0] || {}).body || {}).providers;
      this.authService.updateUserDetails((res[1] || {}).body)
      this.getAvailableMethods(this.providers);
      this.playerData = (res[1] || {}).body;
      this.isRecieveBonuses = this.playerData?.can_issue_bonuses;
      this.recentUsedMethods = (res[2] || {}).body;
      // this.allCurrencies = (res[4] || {}).body;
      this.sharedService.isCurrenciesUpdated.subscribe((res)=>{
        this.allCurrencies=this.sharedService.allCurrencies;
    })

    });

    // this.httpService.getData(APIS.PLAYER.DEPOSIT_BONUSES).subscribe((res) => {
    //   this.bonusTypes = (res || {}).body;
    // });
  }

  getTranslatedText(text) {
    return this.translate.instant(text);
  }

  getData() {
    let currentIp=this.sharedService.currentIP.value;
    this.sharedService.snippets.subscribe(res => {
      if (res.length > 0) {
        let data = JSON.parse(res.find(snippet => snippet.id == "bonus-of-day")?.content)
        if (this.slides.length == 0) {
          this.slides = data.offers || [];
          this.slides=this.slides.filter((offer)=>{
            if(this.router.url.includes(BONUS_PROMOS.PROMO_150)){
            return !offer.key || offer.key==BONUS_PROMOS.PROMO_150
            } else if(this.router.url.includes(BONUS_PROMOS.PROMO)){
              return !offer.key || offer.key==BONUS_PROMOS.PROMO
            } else {
              return !offer.key || offer.key==BONUS_PROMOS.NORMAL
            }
          })
          this.slides = this.slides.map(offer => {
            return offer?.highroller && offer.standard ? { ...offer, activeType: this.bonusTypes1.STANDARD } : offer
          });
          if(currentIp?.country_code=='FI'){
            this.slides=this.slides?.filter((offer)=>{
              return offer?.deposit=='Cashback'
            })
          }
        }
        this.title = data.title;
        // this.getAPIData();
        this.httpService.getData(APIS.PLAYER.STATS).subscribe((res) => {
          if (res.body) {
            this.depositsCount = res?.body?.deposits_count || 0;
          }
          this.filterOffers(this.slides);
        })
      }
    });

    this.displayBonusType = this.translate.instant(`title.${this.activeBonusType}`);

    // this.sharedService.pnpAlowed.subscribe(res => {
    //   this.isPNPAllowed = res;
    // });
  }


  addGtagScript() {
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + environment.gtagKey;
    document.head.prepend(script);
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
          if(this.cryptoPaymentMethods.length>0 && providers.length>1){
            resolve(true)
          } else if(providers.length==1){
            resolve(true);
          }
        }
        else {
          this.cryptoPaymentMethods=await this.getCryptoMethods(provider);
          if(isFiltered && providers.length>1){
            resolve(true)
          }
          else if(providers.length==1){
            resolve(true);
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

  onClickingPaymentMethod(method,index){
    this.methodClicked = true;
    if(method) {
      // if(this.depositForm.value)
      for(const field in this.depositForm?.controls){
        this.depositForm.removeControl(field);
      }
      this.methodData = method;
      this.selectedMethodIndex = index;
      
      this.selectedPaymentMethod = index;
      // console.log('======>',method)
      this.initPaymentProcessing(method);
    }
  }

  /**
   * Checks if the amount is valid for selected method and send data for initiate payment processing
   * @param method 
   */
  checkDepositMethodFields(method, index) {
    this.methodClicked = true;
    this.methodData = method;
    this.selectedMethodIndex = index;


    this.selectedPaymentMethod = index;
    if (this.controls?.amount?.value >= (+method.deposit.min) && this.controls?.amount?.value <= (+method.deposit.max)) {
      this.invalidAmountMessage = '';
      this.invalidAmount = false;
      if (method) {
        this.initPaymentProcessing(method);
      }
    } else {
      this.invalidAmount = true;
      if (this.controls?.amount?.value < (+method.deposit.min)) {
        this.invalidAmountMessage = this.translate.instant(FORM_VALIDATION.AMOUNT_LESS_THAN_REQUIRED);
      }
      if (this.controls?.amount?.value > (+method.deposit.max)) {
        this.invalidAmountMessage = this.translate.instant(FORM_VALIDATION.AMOUNT_EXCEEDING_LIMIT);
      }
    }
  }

  /**
 * Checks for other required fields for the selected method and moves to next step
 * @param method 
 */
  initPaymentProcessing(method) {
    // if(this.selectedMethodFields.length>0){
    // this.selectedMethodFields.forEach((item)=>{
    //   this.depositForm.removeControl(item?.field);
    // })
        // }
 

    this.selectedMethod = method;
    if(this.selectedMethod?.service){
      this.selectedMethodFields = this.filterFields(method?.deposit_form_fields.fields,this.selectedMethod?.service);
    } else{
    this.selectedMethodFields = this.filterFields(method?.deposit_form_fields.fields);
    }
    this.depositForm = this.buildForm(this.selectedMethodFields);
    // console.log("selected fields",this.selectedMethodFields)
  }

  onAmountChange(){
    this.depositForm.get('amount').setValue(this.depositSum)
  }


  /**
   * Submitting form
   */
  submit() {
    if (!this.methodClicked) {
      this.checkDepositMethodFields(this.methodData, this.selectedMethodIndex);
    }

    let data = { ...this.depositForm?.value };
    data['amount']=parseFloat(data.amount).toFixed(2).toString()

    let depositfields = this.selectedMethod?.deposit_form_fields;
    if (depositfields?.config) {
      if (depositfields?.config?.additional_params) {
        data = { ...data, ...depositfields?.config?.additional_params, custom_routes: PAYMENT_CUSTOM_ROUTES };
      }
      if (depositfields?.config?.encrypt_attributes) {
        this.scriptService.load({ name: "encryption", src: depositfields?.config?.encryption_script_url, loaded: false }).subscribe(scriptData => {
          depositfields?.config?.encrypt_attributes.forEach(element => {
            data[element] = window['encryptData'](data[element]) || data[element];
            if (depositfields?.config?.process_url) {
              this.processPaymentWithURL(data, depositfields?.config?.process_url);
            } else {
              this.processPayment(data);
            }
          });
        })
      } else {
        if (depositfields?.config?.process_url) {
          this.processPaymentWithURL(data, depositfields?.config?.process_url);
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
      if(res['txState']=='FAILED') {
        this.errorHandler(res['errors'])
      }
      if(res['txState']=='WAITING_INPUT') {
        if(res['redirectOutput']) {
      if(res['redirectOutput']['url']) {
            this.generateForm(res['redirectOutput']['url'],res['redirectOutput']['parameters'],res['redirectOutput']['method'],res['redirectOutput']['container'])
          }
          else if(res['redirectOutput']['html']){
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
      
    },this.errorHandler)
  }

  generateForm(path, params, method,container) {
    let form = document.createElement('form');
    form.method = method || "post";
    form.action = path;
    form.className='form'
    form.target = '_self'
    if(container=='page-redirect'){
      form.enctype="multipart/form-data"
    }

    for (let key in params) {
      if (params.hasOwnProperty(key)) {
        let input = document.createElement('input');
        input.type = 'text'
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
    }
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

  getTwoDigitNumber(d) {
    return (+d < 10 && d.length == 1 ? '0' : '') + String(d);
  }

  /**
   * Initiates payment after getting data submission response
   * @param paymentData 
   */
  initPayment(paymentData) {
    this.headerService.fetchData();
    this.headerService.isUpdateAccount.next(true)
    switch (paymentData.mode) {
      case 'notify':
        this.title = "Processing";
        this.successMessage = this.getMessages(MESSAGES.SUCCESS.REQUEST_ACCEPTED);
        this.step = this.STEPS.STATUS;
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
        // this.httpService.post(paymentData.options.url, formData).subscribe(paymentDetails => {
        //   console.log(paymentDetails);
        // },this.errorHandler);
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
  filterFields(fields,service?) {
    let fieldsArray = [];
    fields?.forEach(field => {
      
      let isFieldAllowed=true;
      if(field?.services?.only?.length>0 || field?.services?.except?.length>0){
        let isServiceAllowed=true;
        if(field?.services?.only?.length>0){
          if(service){
            field?.services?.only.forEach(res => { return res.toUpperCase() === service.toUpperCase(); });
            isServiceAllowed=true;
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
      let value = {};
      value['field'] = field.field;
      value['value'] = field?.value || '';
      if (field?.html_content) {
        fieldsArray.push(field);
      } else {
        switch (field.field) {
          case 'amount':
            // value['label'] = "Amount"
            value['label'] = this.translate.instant("title.deposit_sum")
            value['type'] = "number";
            value['step'] = field.step;
            value['validations'] = { min: field?.min || null, max: field?.max || null };
            value['value'] = this.form.controls.amount.value || field?.value || '';
            break;
          case 'email':
            value['label'] = field?.label || this.translate.instant("forms.label.email");
            value['type'] = "text";
            value['validations'] = { pattern: REGEX.EMAIL }
            break;
          case 'account':
            value['label'] = field?.label || this.translate.instant("forms.label.email")
            value['type'] = "text";
            value['validations'] = { pattern: REGEX.EMAIL }
            break;
          case 'NeoSurfEmail':
            value['label'] = field?.label || this.translate.instant("forms.label.email")
            value['type'] = "text";
            value['validations'] = { pattern: REGEX.EMAIL }
            break;
          case 'service':
            value['label'] = field?.label || this.translate.instant("forms.label.bank_services")
            value['type'] = 'select';
            value['placeholder']="Select your bank"
            // value['validations']={required:true};
            value['options'] = field?.options;
            break;
            case 'account_type':
            value['label'] = field?.label || this.translate.instant("forms.label.account_type")
            value['type'] = 'select';
            value['placeholder']="Select type"
            // value['validations']={required:true};
            value['options'] = field?.options;
            break;
          case 'phoneNumber':
            value['label'] = field?.label || this.translate.instant("forms.label.phone_number")
            value['type'] = 'text',
              value['validations'] = {
                pattern: REGEX.ONLY_DIGITS,
                maxLength: 16,
                minLength: 5
              };
            break;
          case 'phone':
              value['label'] = field?.label || this.translate.instant("forms.label.phone_number")
              value['type'] = 'text',
              value['validations'] = {
              pattern: REGEX.ONLY_DIGITS,
                  maxLength: 16,
                  minLength: 5
                };
            break;
          case 'encCreditcardNumber':
            value['label'] =  field?.label || this.translate.instant("forms.label.card_number_label")
            value['type'] = field.type,
              value['validations'] = {
                required: true,
              }
            break;
          case 'cardHolder':
            value['label'] = field?.label || this.translate.instant("forms.label.card_holder")
            value['type'] = field.type,
              value['validations'] = {
                required: true,
              }
            break;
          case 'expiry_date':
            value['label'] = field?.label || this.translate.instant("forms.label.expiry_date")
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
            value['country']=field.primary,
            value['bank_code']=field.secondary
            if(field?.values){
              value['values'] = field?.values;
            }
            break;
              
          case 'cvv':
            value['label'] = "CVV"
            value['type'] = 'cvv';
            value['validations'] = {
              minLength: 3,
              required: true,
            }
            break;
          case 'address':
            if(field?.type=='crypto_address'){
              value['app_path']=field?.app_path
              value['currency']=field?.currency
              value['placeholder']=field?.placeholder
              value['type']=field?.type
            }
            break;
            // case 'bic':
            //   if(field?.type=='crypto_address'){
            //     value['label'] = field?.label || field?.field
            //     value['type'] =  field.type;
            //     value['placeholder']=field?.placeholder
            //     value['type']=field?.type
            //   }
            //   break;
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
      // console.log('fields=====> ',fields)
      fields.forEach((item, i) => {
        if (item.field) {
          if (item.field == 'expiry_date') {
            this.group[item.month] = new FormControl('', this.getValidators(item.validations));
            this.group[item.year] = new FormControl('', this.getValidators(item.validations));
            // let subgroup = {};
            // subgroup[item.month] = new FormControl('', this.getValidators(item.validations));
            // subgroup[item.year] = new FormControl('', this.getValidators(item.validations));
            // this.group[item.field] = new FormGroup(subgroup)
          } 
          else if(item.field == 'country_and_bank'){
            this.group[item.country] = new FormControl('', this.getValidators(item.validations));
            this.group[item.bank_code] = new FormControl('', this.getValidators(item.validations));
          }
          else {
            this.group[item.field] = new FormControl(item?.value || '', this.getValidators(item.validations));
          }
        }
      })
      return new FormGroup(this.group)
    }
  }

  sanitize(url:string){
    return this.sanitizer.bypassSecurityTrustUrl(url);
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
    if (validations) {
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
    switch (method.brand) {
      case 'bank':
      //   return `${environment.imgBaseURL}${URLS.PAYMENT_LOGO}/${method.provider}-sofort.svg`;
      return ''
      case 'skrillqco':
        return `${environment.imgBaseURL}${URLS.PAYMENT_LOGO}/${method.provider}-skrill.svg`;
     case 'funanga':
          return `${environment.imgBaseURL}${URLS.PAYMENT_LOGO_WHITE}/${method.provider}-${method.brand}.svg`;
      case 'coinspaid':
        return `${environment.imgBaseURL}${URLS.PAYMENT_LOGO_WHITE}/${this.paymentMethods[i]?.deposit_form_fields?.config?.original_currency}_${method.brand}.svg`;
      case 'ideal':
        return `${environment.imgBaseURL}${URLS.PAYMENT_LOGO_WHITE}/${method.brand}.svg`;
      case 'trustly':
        return `${environment.imgBaseURL}${URLS.PAYMENT_LOGO_WHITE}/${method.provider}.svg`;
      case 'online_bank_transfer':
        return `${environment.imgBaseURL}${URLS.PAYMENT_LOGO_WHITE}/rapid-transfer.svg`;
      case 'mifinity':
        return `${environment.imgBaseURL}${URLS.PAYMENT_LOGO}/${method.provider}-${method.brand}.svg`;
      case 'webredirect':
        return `${environment.imgBaseURL}${URLS.PAYMENT_LOGO}/${method.provider}-sticpay.svg`;
      default:
        if(method.brand!=method.provider)
        return `${environment.imgBaseURL}${URLS.PAYMENT_LOGO}/${method.provider}-${method.brand}.svg`;
        else
        return `${environment.imgBaseURL}${URLS.PAYMENT_LOGO_WHITE}/${method.provider}.svg`;
    }
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

  getName(name, method) {
    switch (name) {
      // case 'bank':
      //   return 'Sofort';
      case 'online_bank_transfer':
        if (method.provider == 'skrill') {
          return 'Skrill Rapid Transfer'
        } else {
          return name.split('_').join(" ");
        }
      default:
        return name.split('_').join(" ");
    }
  }
  goTo(path) {
    this.router.navigate([path]);
    this.activeModal.close()
  }

  back() {
    this.invalidAmount = false;
    // Object.keys(this.depositForm.controls).forEach(ctrl => {
    //   this.depositForm.removeControl(ctrl);
    // });

    this.step--;
  }

  // myProfile() {
  //   let profileModal = this.ngModal.open(MyProfileComponent, {
  //     size: 'lg',
  //     centered: true,
  //     backdrop: 'static',
  //     keyboard: false,
  //   });
  //   profileModal.componentInstance.goToDeposits = true;
  // }

  getMessages(message) {
    return this.translate.instant(message);
  }


  errorHandler(error) {
    let errors = Object.keys(error) || Object.keys(error.errors);
    this.isPromoChecking=false;
    errors.forEach(key => {
      let titles = Object.keys(error[key]);
      titles.forEach((err) => {
        // this.alertService.error(`${+key || +key==0?'':key} ${(error[key][err])}`);
        this.alertService.error((error[key][err]));
      })
    });
  }

  selectedValue(event) {

    this.depositSum = parseInt(event.target.innerHTML)
    this.form.patchValue({ amount: parseInt(event.target.innerHTML) })
    // this.depositForm.patchValue({ amount: parseInt(event.target.innerHTML) })
    this.onAmountChange()

    this.valueCheck(event.target.innerHTML);
  }

  valueCheck(val) {
    if (val == 25) {
      this.show25 = true;
      this.show50 = false;
      this.show100 = false;
      this.show200 = false;
      this.show500 = false;
    }
    if (val == 50) {
      this.show50 = true;
      this.show25 = false;
      this.show100 = false;
      this.show200 = false;
      this.show500 = false;
    }
    if (val == 100) {
      this.show100 = true;
      this.show25 = false;
      this.show50 = false;
      this.show200 = false;
      this.show500 = false;
    }
    if (val == 200) {
      this.show200 = true;
      this.show25 = false;
      this.show50 = false;
      this.show100 = false;
      this.show500 = false;
    }
    if (val == 500) {
      this.show500 = true;
      this.show25 = false;
      this.show50 = false;
      this.show100 = false;
      this.show200 = false;
    }
  }

  changeCurrency(event) {
    this.form.patchValue({ currency: event.target.innerHTML })

    this.currency = event.target.innerHTML;
    for (var i = 0; i < this.balanceData.length; i++) {
      if (event.target.innerHTML == this.balanceData[i].currency) {
        this.balance = parseInt(this.balanceData[i].amount_cents);
        // this.currency = this.balanceData[i].currency;
        this.transformBalance(this.balanceData[i].amount_cents, this.balanceData[i].currency)
        // this.form.patchValue({ balanceAmount: this.balanceData[i].amount_cents });
      }
    }

    this.httpService.getData(`${APIS.PAYMENTS.PAYMENT_METHODS}/${this.currency}`).subscribe(paymentMethods => {
      this.paymentMethods = ((paymentMethods || {}).body || {}).methods || Payment_Methods.methods;
      let providers=((paymentMethods || {}).body || {}).providers
      this.getAvailableMethods(providers);
      // console.log("this.paymentMethods: ", this.paymentMethods)
    })
    // console.log("this.paymentMethods: ", this.paymentMethods)

  }

  depositValueChange(event) {

    this.depositSum = parseInt(event.target.value);
    this.form.patchValue({ amount: parseInt(event.target.value) });
    // this.depositForm.patchValue({ amount: parseInt(event.target.value) })

    // this.controls.amount = this.depositSum;

    if (this.depositSum != 25 && this.depositSum != 50 && this.depositSum != 100 && this.depositSum != 200 && this.depositSum != 500) {
      this.show200 = false;
      this.show25 = false;
      this.show50 = false;
      this.show100 = false;
      this.show500 = false;
    }
    else {
      this.valueCheck(this.depositSum);
    }
  }

  useBonus(event) {
    this.useBonuses = event.target.checked
    this.httpService.patchData(APIS.PLAYER.UPDATE_BONUS_SETTINGS, { "can_issue": this.useBonuses }).subscribe((res) => {
      this.sharedService.hideTabs((this.useBonuses)?null:["loyalty_program"])
      this.isRecieveBonuses = this.useBonuses
    })
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
    // })
  }


  filterOffers(promotions) {
    this.filteredSlides = [];
    let d = new Date();
    promotions.forEach((offer) => {
      if (typeof (offer.deposit) == PROMOTION_BONUSES_TYPE.NUMBER) {
        if (offer.deposit == this.depositsCount + 1) {
          this.filteredSlides.push(offer);
        }
      } else {
        if (offer.deposit == WEEKDAYS[d.getDay()]) {
          this.filteredSlides.push(offer);
        }
        else if (offer.deposit == PROMOTION_BONUSES_TYPE.CASHBACK) {
          this.filteredSlides.push(offer);
        }
      }
    })
  }

}

