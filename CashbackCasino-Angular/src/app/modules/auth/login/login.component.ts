import { Component, OnInit, HostListener, ViewContainerRef, ComponentFactoryResolver, QueryList, AfterViewInit, ViewChildren, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { AuthService, HttpService, AlertService, ModalService, SharedService } from 'src/app/core/services';
import { APIS, DEFAULT_VALUES, URLS, FORM_VALIDATION, REGEX, PAYMENT_CUSTOM_ROUTES, MESSAGES, TRANSACTION_TYPES, DISCARDED_PAYMENT_METHODS, SORT_PAYMENT_METHODS, ONLY_ALLOWED_PAYMENT_PROVIDERS } from 'src/app/common/constants';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { UnlockEmailComponent } from '../unlock-email/unlock-email.component';
import { ConfirmationEmailComponent } from '../confirmation-email/confirmation-email.component';
import { MyProfileComponent } from '../../users/my-profile/my-profile.component';
import { environment } from 'src/environments/environment';
import { ReCaptchaV3Service } from 'ngx-captcha';
import { CurrencyConverterPipe } from 'src/app/core/pipes/currencyConverter.pipe';
import { ForgotPasswordComponent } from '../forgot-password/forgot-password.component';
import { DepositBonusesComponent } from '../../users/bonuses/deposit-bonuses/deposit-bonuses.component';
import { TranslateService } from '@ngx-translate/core';
import { RegisterComponent } from '../register/register.component';
import { HeaderService } from 'src/app/core/services/header.service';
import { BonusFreespinsService } from 'src/app/core/services/bonus-freespins.service';
import * as _ from 'lodash';
import { ScriptLoaderService } from 'src/app/core/services/script.service';
import { UpdatetermsComponent } from '../../users/updateterms/updateterms.component';
import { UserService } from 'src/app/core/services/user.service';
import { IframeComponent } from '../../shared/iframe/iframe.component';
import { SignupComponent } from '../signup/signup.component';
import { forkJoin } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';


@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, AfterViewInit {
  @ViewChildren('bonusComponent', { read: ViewContainerRef })
  bonusComponent: QueryList<ViewContainerRef>;
  form: FormGroup;
  isDeposits;
  form2: FormGroup;
  depositComponent;
  isSubmit: Boolean;
  isProcessing = false;
  bonuses = false
  empty = 0.00;
  title;
  show: Boolean = false;
  showCaptcha: Boolean = false;
  captchaVersion: Number;
  siteKey: string;
  step: number = 1;
  formHeaderText: string = "login_to_praise_casino";
  closeModal: Boolean = false;
  currency = 'EUR';
  paymentMethods:any = [];
  selectedPayment = {};
  playerData;
  successMessage;
  allCurrencies = [];
  bonusTypes;
  invalidAmount = false;
  invalidAmountMessage;
  selectedMethod;
  selectedMethodFields;
  group = {};
  discardedMethods = DISCARDED_PAYMENT_METHODS;
  currentYear;
  depositForm;
  promocode;
  promocodeFlag = false;
  promocodeMsg;
  isPromoChecking:boolean=false;
  STEPS = {
    LOGIN_FORM: 1,
    AMOUNT: 2,
    PAYMENT_METHODS: 3,
    PAYMENT_DETAILS: 4,
    STATUS: 5,
    REDIRECT:6
  }
  isLoggedIn: boolean = false;
  mobileView: string = "left";
  mobile: boolean = false;
  hideBonuses;
  hideCashbackBonuses;
  cryptoPaymentMethods:any=[];
  currentCountry:string;
  range = (start, stop, step) => Array.from({ length: (stop - start) / step + 1 }, (_, i) => start + (i * step));
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.mobile = (window.innerWidth <= DEFAULT_VALUES.MOBILE_SIZE) ? true : false;
  }
  route;
  redirectionRoute;
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private httpService: HttpService,
    private activeModal: NgbActiveModal,
    private router: Router,
    private translate: TranslateService,
    private translateService: TranslateService,
    private converCurrency: CurrencyConverterPipe,
    private reCaptchaV3Service: ReCaptchaV3Service,
    private alertService: AlertService,
    private modalService: ModalService,
    private headerService: HeaderService,
    private componentFactoryResolver: ComponentFactoryResolver,
    private scriptService: ScriptLoaderService,
    private userService:UserService,
    private cdf: ChangeDetectorRef,
    private sharedService:SharedService,
    private sanitizer:DomSanitizer
    ) {
    this.errorHandler = this.errorHandler.bind(this);
  }

  ngOnInit(): void {
    this.currentCountry = this.sharedService.currentIP.value.country_code;
    if (window.innerWidth <= DEFAULT_VALUES.MOBILE_SIZE) { // 768px portrait
      this.mobile = true;
    }
    // First we get the viewport height and we multiple it by 1% to get a value for a vh unit
    let vh = window.innerHeight * 0.01;
    // Then we set the value in the --vh custom property to the root of the document
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    this.authService.authentication.subscribe((res) => {
      this.isLoggedIn = !!res;
    })
    this.playerSetting();
    this.initForm();
  }


  ngAfterViewInit() {
    if (this.bonusComponent?.length > 0) {
      // The container already exists
      this.addBonusComponent();
    };
    this.bonusComponent?.changes.subscribe(() => {
      // The container has been added to the DOM
      if (this.bonusComponent?.length > 0) {
        this.addBonusComponent();
      }
    });
  }

  /**
   * Add Bonus component dynamically
   */
  private addBonusComponent() {
    const container = this.bonusComponent.first;
    const factory = this.componentFactoryResolver.resolveComponentFactory(DepositBonusesComponent);
    const ref = container.createComponent(factory);
    ref.instance.type = 'deposit';
    this.cdf.detectChanges();
  }


  /** -- function to initialize the form */
  initForm() {
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.pattern(REGEX.EMAIL), Validators.maxLength(64)]],
      password: ['', [Validators.required]],
      captcha: ['', []],
    });
    this.form2 = this.formBuilder.group({
      amount: ['', [Validators.required]],
      currency: [this.currency],
    });
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
          }
          else if(providers.length==1 ){
            resolve(true);
          }
        }
        else {
          this.cryptoPaymentMethods=await this.getCryptoMethods(provider);
          if(isFiltered  && providers.length>1){
            resolve(true)
          }
          else if(providers.length==1 ){
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


  getAPIData() {
    this.currency = this.authService.getUserData('currency');

    // let apiCalls = [
    //   this.httpService.getData(`${APIS.PAYMENTS.PAYMENT_METHODS}/${this.currency}`),
    //   this.httpService.getData(APIS.PLAYER.DATA),
    //   this.httpService.getData(APIS.CURRENCIES)
    //   // this.httpService.getData(APIS.PAYMENTS.PAYMENT_ACCOUNTS, { kind: "deposit" }),
    //   // this.httpService.getData(APIS.USER_LIMITS),
    // ]

    // forkJoin(apiCalls).subscribe((res) => {
    //   this.paymentMethods = ((res[0] || {}).body || {}).methods || Payment_Methods.methods;
    //   this.paymentMethods = this.paymentMethods.filter((method) => {
    //     return method.deposit;
    //   });
    //   this.playerData = (res[1] || {}).body;
    //   this.allCurrencies = (res[2] || {}).body;
    // });
    // this.httpService.getData(APIS.PLAYER.DEPOSIT_BONUSES).subscribe((res) => {
    //   this.bonusTypes = (res || {}).body;
    //   this.bonusTypes = this.bonusTypes.filter((res) => {
    //     return res.bonuses[0].type == 'bonus'
    //   });
    // });

    this.httpService.getData(`${APIS.PAYMENTS.PAYMENT_METHODS}/${this.currency}`).subscribe(res => {
      this.paymentMethods = ((res || {}).body || {}).methods;
      let providers=((res || {}).body || {}).providers;
      this.getAvailableMethods(providers)


    });
    this.headerService.userData.subscribe((data) => {
      if (data) {
        this.playerData = data.playerData;
        this.allCurrencies = data.currencies;
      }
    })
    // this.bonusService.fetchDepositBonus();
    // this.bonusService.depositBonuses.subscribe((res) => {
    //   if (res) {
    //     this.bonusTypes = res?.bonuses;
    //     this.bonusTypes = this.bonusTypes.filter((res) => {
    //       return res.bonuses[0].type == 'bonus'
    //     });
    //   }
    // })


  }

  /** - get player settings */
  playerSetting() {
    this.httpService.getData(APIS.PLAYER.SETTINGS).subscribe(resp => {
      // TODO: Handle Response
      let config = resp.body;
      this.showCaptcha = !!config.recaptcha;
      this.siteKey = config.recaptcha;
      this.captchaVersion = config.recaptcha_version || 2;
      if (this.showCaptcha && this.captchaVersion == 3) {
        this.reCaptchaV3Service.execute(this.siteKey, '', (token) => {
          this.controls.captcha.patchValue(token);
        });
      }
    });
  }

  /** -- function to submit the form */
  onSubmit() {

    this.isSubmit = true;
    if (this.form.invalid) {
      this.validateAllFormFields(this.form);
    }
    else {
      let submitData = { user: this.form.value };
      if (this.showCaptcha && submitData.user.captcha === "") {
        submitData.user.captcha = "blank";
      }
      if (submitData.user.captcha === "") {
        delete submitData.user.captcha;
      }
      this.authService.login(submitData).subscribe((res: any) => {
        // TODO: Handle Response)
        this.getPaymentMethods();
        let currentLang = this.translateService.currentLang;
        if (res.language && res.language != currentLang) {
          // this.translateService.use(res.language).subscribe( suc => {
          //   let updatedUrl = this.router.routerState.snapshot.url.replace('/'+currentLang,'/' + res.language);
          //   this.router.navigateByUrl(updatedUrl);
          // }, err => {
          //   /** -- if error then set last language as current locale */
          //   this.translateService.use(currentLang);
          // });
        }
        this.authService.saveUserData(res);
        this.formHeaderText = "now_logged_in"
        this.step = this.STEPS.AMOUNT;
        if (this.mobile) this.mobileView = 'left';
        this.getAPIData();
        // this.realTimeService.get_config();
        // this.sharedService.setSnippetsData();
        this.sharedService.isHideBonuses.subscribe((res)=>{
          this.hideBonuses=res;
        });
        this.sharedService.isHideCashbackBonus.subscribe((res)=>{
          this.hideCashbackBonuses=res;
        })
      }, (err) => {
        if (err.email) {
          if (err.email.unconfirmed) {
            this.activeModal.close();
            this.modalService.openModal(ConfirmationEmailComponent, { emailId: this.form.value.email });
          }
          else if (err.email.not_found_in_database) {
            this.alertService.error(err.email['not_found_in_database'])
          }

        }
        else if (err.password) {
          if (err.password['wrong_password']) {
            this.alertService.error(err.password['wrong_password']);
          } else if (err.password['locked']) {
            this.activeModal.close();
            this.modalService.openModal(UnlockEmailComponent, { emailId: this.form.value.email });
          } else if (err.password['limit_restrict_access']) {
            // this.alertService.error(err.password['limit_restrict_access']);
            this.activeModal.close();
            this.modalService.openModal(UnlockEmailComponent, { step: 7 });
          }
        }
      });
    }
  }

  getPaymentMethods() {
    this.httpService.getData(`${APIS.PAYMENTS.PAYMENT_METHODS}/${this.currency}`).subscribe(res => {
      this.paymentMethods = ((res || {}).body || {}).methods;
      let providers=((res || {}).body || {}).providers
      this.getAvailableMethods(providers);
      // this.paymentMethods = this.paymentMethods.filter((method) => {
      //   return method.deposit && method.deposit_form_fields && !_.find(this.discardedMethods, {brand:method.brand,provider:method.provider}) && (['sofort','ideal','trustly','interac'].includes(method.brand)?ONLY_ALLOWED_PAYMENT_PROVIDERS[method.brand]?.includes(this.userService.country):true) ;
      //   // return method.deposit && !_.find(this.discardedMethods, { brand: method.brand, provider: method.provider });
      // });
    });
  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  stepSkip(step?) {
    if (step && step!==this.STEPS.STATUS) this.step = step; else this.step++;
    if (this.mobile) this.mobileView = "left";
    if(step==this.STEPS.STATUS) {
      this.close('yes');
      if (this.playerData?.auth_fields_missed?.length > 0) {
        this.modalService.openModal(UpdatetermsComponent,{playerData:this.playerData});
    }else if(!this.playerData?.mobile_phone){
      this.modalService.openModal(UpdatetermsComponent,{step:2,playerData:this.playerData})
    }
    }

  }

  stepClass(step) {
    if (this.step == this.STEPS.STATUS) {
      return 'completed step-completed';
    }
    return this.step > step ? 'completed step-completed' : (this.step == step) ? 'next disabled' : 'disabled'

  }

  sanitize(url:string){
    return this.sanitizer.bypassSecurityTrustUrl(url);
}

  stepMove(step) {
    if (this.mobile && this.step <= step) {
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

  startPlaying() {
    this.close('yes');
    if (this.playerData.auth_fields_missed?.length > 0) {
      for (var i = 0; i < this.playerData.auth_fields_missed?.length; i++) {
        if (this.playerData.auth_fields_missed[i] == "terms_acceptance") {
          this.modalService.openModal(UpdatetermsComponent,{step:0,playerData:this.playerData});
          break;
        }
      }
    }
  }
  close(value?) {
    if (value == 'yes' || this.isLoggedIn) {
      if (this.router.url.includes('signin')) {
        this.router.navigate(['/']);
      }
      if(this.redirectionRoute && this.isLoggedIn){
        if(this.redirectionRoute.includes('play-games'))
        {
          this.router.navigate(['/play-games',this.route])

        } else{
        this.router.navigate([this.redirectionRoute]);
        }
      }
      this.activeModal.close();
      // this.location.back();
    } else {
      this.closeModal = !this.closeModal
    }
  }

  openSignUpModal() {
    this.activeModal.close();
    this.modalService.openModal(SignupComponent);
  }

  openForgotPasswordModal() {
    this.activeModal.close();
    this.modalService.openModal(ForgotPasswordComponent);
  }


  getValue(bonus) {
    if (this.playerData) {
      let status = (this.playerData || {}).statuses.find(status => {
        return status.id == bonus.bonuses[0].conditions[0].value[0]
      });
      if (status) {
        return true;
      }
    }
    return false;
  }

  updateBonuses(event, bonus) {
    let groups = {};
    if (event.target.checked) {
      if (((this.playerData || {}).statuses || {}).length > 0) {
        groups['remove'] = [];
        groups['remove'].push(((this.playerData || {}).statuses[0] || {}).id);
      }
      groups['add'] = [];
      groups['add'].push(bonus.bonuses[0].conditions[0].value[0]);
    } else {
      groups['remove'] = [];
      groups['remove'].push(bonus.bonuses[0].conditions[0].value[0]);
    }
    this.httpService.postData(APIS.PLAYER.GROUPS, { groups: groups }).subscribe((res) => {
      this.httpService.getData(APIS.PLAYER.DATA).subscribe((res) => {
        this.playerData = (res || {}).body;
      })
    });

  }

  get controls() {
    return this.form.controls;
  }

  get depositControls() {
    return this.form2.controls;
  }

  getUrl(method,i?) {
    switch (method.brand) {
      case 'bank':
        //   return `${environment.imgBaseURL}${URLS.PAYMENT_LOGO}/${method.provider}-sofort.svg`;
        return ''
        case 'skrillqco':
          return `${environment.imgBaseURL}${URLS.PAYMENT_LOGO}/${method.provider}-skrill.svg`;
        case 'ideal':
          return `${environment.imgBaseURL}${URLS.PAYMENT_LOGO}/${method.brand}.svg`;
        case 'trustly':
          return `${environment.imgBaseURL}${URLS.PAYMENT_LOGO}/${method.provider}.svg`;
        case 'online_bank_transfer':
          return `${environment.imgBaseURL}${URLS.PAYMENT_LOGO}/rapid-transfer.svg`;
        case 'mifinity':
          return `${environment.imgBaseURL}${URLS.PAYMENT_LOGO}/${method.provider}-${method.brand}.svg`;
        case 'webredirect':
          return `${environment.imgBaseURL}${URLS.PAYMENT_LOGO}/${method.provider}-sticpay.svg`;

      case 'coinspaid':
        return `${environment.imgBaseURL}${URLS.PAYMENT_LOGO}/${this.paymentMethods[i]?.deposit_form_fields?.fields[0]?.currency}_${method.brand}.svg`;
      default:
        if(method.brand!==method.provider)
        return `${environment.imgBaseURL}${URLS.PAYMENT_LOGO}/${method.provider}-${method.brand}.svg`;
        else
        return `${environment.imgBaseURL}${URLS.PAYMENT_LOGO}/${method.provider}.svg`;
    }
  }

  get formControls() { return this.form.controls; }


  checkDepositMethodFields(method) {
    if (this.depositControls.amount.value >= (+method.deposit.min) && this.depositControls.amount.value <= (+method.deposit.max)) {
      this.invalidAmountMessage = '';
      this.invalidAmount = false;
      this.isProcessing = true;
      if (method) {
        this.initPaymentProcessing(method);
      }
    } else {
      this.isProcessing = false;
      this.invalidAmount = true;
      if (this.depositControls.amount.value < (+method.deposit.min)) {
        this.invalidAmountMessage = this.translate.instant(FORM_VALIDATION.AMOUNT_LESS_THAN_REQUIRED);
      }
      if (this.depositControls.amount.value > (+method.deposit.max)) {
        this.invalidAmountMessage = this.translate.instant(FORM_VALIDATION.AMOUNT_EXCEEDING_LIMIT);
      }
    }
  }

  /**
* Checks for other required fields for the selected method and moves to next step
* @param method 
*/
  initPaymentProcessing(method) {
    if(this.selectedMethodFields?.length>0){
      this.selectedMethodFields.forEach((item)=>{
        this.depositForm.removeControl(item?.field);
      })
      }
    this.selectedMethod = method;
    if(this.selectedMethod?.service){
      this.selectedMethodFields = this.filterFields(method?.deposit_form_fields.fields,this.selectedMethod?.service);
    } else{
    this.selectedMethodFields = this.filterFields(method?.deposit_form_fields.fields);
    }
    this.depositForm = this.buildForm(this.selectedMethodFields);
    if (this.selectedMethodFields.length >= 1) {
      this.step = this.STEPS.PAYMENT_DETAILS;
    } else {
      this.processPayment(this.form2.value);
    }
  }

  /**
 * Submitting form
 */
  submit() {
    let data = { ...this.depositForm.value };
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
            }
            if (res['redirectOutput']['method'] == 'POST') {
              this.generateForm(res['redirectOutput']['url'], res['redirectOutput']['parameters'], res['redirectOutput']['method'],res['redirectOutput']['container'])
            }
          } else if(res['redirectOutput']['html']){
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
    switch (paymentData.mode) {
      case 'notify':
        this.title = "Processing";
        this.successMessage = this.getTranslatedText(MESSAGES.SUCCESS.REQUEST_ACCEPTED);
        this.step = this.STEPS.STATUS;
        break;

      case 'redirect':
        // window.location.href = paymentData.url;
        // this.generateForm(paymentData?.url ,{params:paymentData?.options?.data?.params},'POST','redirect')
        this.step=this.STEPS.REDIRECT;
        this.getIframe(paymentData?.url ,'redirect')
        break;

      case 'page_redirect':
        this.modalService.openModal(IframeComponent, {src:paymentData.options.url, params:paymentData.options.data,container:'page-redirect'})
    }
  }

  addGtagScript() {
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + environment.gtagKey;
    document.head.prepend(script);
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
      let value = {};
      value['field'] = field.field;
      value['value'] = field?.value || '';
      if (field?.html_content) {
        fieldsArray.push(field);
      } else {
        switch (field.field) {
          case 'amount':
            value['label'] = "Amount"
            value['type'] = "number";
            value['step'] = field.step;
            value['validations'] = { min: field?.min || null, max: field?.max || null };
            value['value'] = this.depositControls.amount.value || field?.value || '';
            break;
          case 'email':
            value['label'] = "Email"
            value['type'] = "text";
            value['validations'] = { pattern: REGEX.EMAIL }
            break;
          case 'service':
            value['label'] = "Bank Services"
            value['type'] = 'select';
            value['placeholder']="Select your bank"
            // value['validations']={required:true};
            value['options'] = field?.options;
            break;
          case 'account_type':
            value['label'] = "Account type"
            value['type'] = 'select';
            value['placeholder']="Select type"
            // value['validations']={required:true};
            value['options'] = field?.options;
            break;
          case 'phone' || 'phoneNumber':
            value['label'] = "Phone Number"
            value['type'] = 'text',
              value['validations'] = {
                pattern: REGEX.ONLY_DIGITS,
                maxLength: 16,
                minLength: 5
              };
            break;
          case 'encCreditcardNumber':
            value['label'] = "Card Number"
            value['type'] = field.type,
              value['validations'] = {
                required: true,
              }
            break;
          case 'cardHolder':
            value['label'] = "Card Holder"
            value['type'] = field.type,
              value['validations'] = {
                required: true,
              }
            break;
          case 'expiry_date':
            value['label'] = "Expiry Date"
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
          case 'address':
            if (field?.type == 'crypto_address') {
              value['app_path'] = field?.app_path
              value['currency'] = field?.currency
              value['placeholder'] = field?.placeholder
              value['type'] = field?.type
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
          default:
            if (field.field == 'account_identifier') {
                value['label'] = 'IBAN';
            }
            else if (field.field == 'swift') {
                value['label'] = 'BIC/SWIFT';
            } else {
                value['label'] = field?.label || field?.field.split('_').join(" ");
            }
            value['type'] = field.type;
            if (field?.options) {
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

  /**
   * Builds dynamic form with fields data
   * @param fields 
   */
  buildForm(fields) {
    if (fields) {
      fields.forEach((item, i) => {
        if (item.field) {
          if (item.field == 'expiry_date') {
            this.group[item.month] = new FormControl('', this.getValidators(item.validations));
            this.group[item.year] = new FormControl('', this.getValidators(item.validations));
            // let subgroup = {};
            // subgroup[item.month] = new FormControl('', this.getValidators(item.validations));
            // subgroup[item.year] = new FormControl('', this.getValidators(item.validations));
            // this.group[item.field] = new FormGroup(subgroup)
          } else if(item.field == 'country_and_bank'){
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

  
  goTo(path) {
    this.router.navigate([path]);
    this.activeModal.close();
  }

  getTwoDigitNumber(d) {
    return (+d < 10 && d.length == 1 ? '0' : '') + String(d);
  }

  getMaxAmount(bonus) {
    let obj = bonus.bonuses[0].attributes[0].value.default.find(value => {
      return value.currency == this.currency;
    });
    if (obj) {
      return this.converCurrency.transform(obj.amount_cents, [this.currency, this.allCurrencies]);
    }
    return this.converCurrency.transform(bonus.bonuses[0].attributes[0].value.default[0]?.amount_cents, [this.currency, this.allCurrencies]);
  }

  back() {
    this.invalidAmount = false;
    this.isProcessing=false
    this.step--;
  }

  getCurrencyTransformation(value, currency) {
    return this.converCurrency.transform(value, [currency, this.allCurrencies]);
  }

  myProfile() {
    this.modalService.openModal(MyProfileComponent, { goToDeposits: true });
  }

  getTranslatedText(text) {
    return this.translateService.instant(text);

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



  sortMethods(methods) {
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
  }

  errorHandler(error) {
    this.isProcessing = false;
    let errors = Object.keys(error);
    errors.forEach(key => {
      let titles = Object.keys(error[key]);
      titles.forEach((err) => {
        this.alertService.error(`${(error[key][err])}`);
      })
    });
  }
}
