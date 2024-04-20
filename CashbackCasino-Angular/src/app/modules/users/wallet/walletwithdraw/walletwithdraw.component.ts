import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { AuthService, HttpService, AlertService, ModalService, SharedService } from 'src/app/core/services';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { APIS, URLS, FORM_VALIDATION, MESSAGES, PAYMENT_CUSTOM_ROUTES, REGEX, USER_DETAILS, DISCARDED_PAYMENT_METHODS, ONLY_ALLOWED_PAYMENT_PROVIDERS, SORT_PAYMENT_METHODS, TRANSACTION_TYPES, ROUTING } from 'src/app/common/constants';
import { Payment_Methods } from 'src/app/core/mocks/payment-methods';
import { forkJoin } from 'rxjs';
import { environment } from 'src/environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { HeaderService } from '../../../../core/services/header.service';
import { UserService } from 'src/app/core/services/user.service';
import * as _ from 'lodash';
import { ScriptLoaderService } from 'src/app/core/services/script.service';
import { CurrencyConverterPipe } from 'src/app/core/pipes/currencyConverter.pipe';
import { Router } from '@angular/router';
import { IframeComponent } from 'src/app/modules/shared/iframe/iframe.component';
import { RestrictionsService } from 'src/app/core/services/restrictions.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-walletwithdraw',
  templateUrl: './walletwithdraw.component.html',
  styleUrls: ['./walletwithdraw.component.scss']
})
export class WalletwithdrawComponent implements OnInit {

  form: FormGroup;
  // @Input() methodData: any;
  methodData;
  step = 1;
  currency = 'EUR';
  paymentMethods:any = [];
  recentUsedMethods = [];
  successMessage;
  title;
  allCurrencies = [];
  playerData;
  statusData;
  group={};
  invalidAmount = false;
  invalidAmountMessage;
  pendingWithdrawal;
  

  balance = 0;
  dropDownCurrency;
  withdrawable;
  lockedByBonus;
  @Input() balanceData;
  @Input() selectedCurrency;
  show100 = false;
  show200 = false;
  show500 = false;
  withdrawalValue;
  selectedPaymentMethod = false;
  methodClicked = false;
  selectedWithdrawlMethodIndex = -1;
  selectedMethodFields;
  selectedMethod;
  currentYear;
  email;
  phoneNo;
  panNo;
  discardedMethods = DISCARDED_PAYMENT_METHODS;
  cashoutForm:FormGroup= new FormGroup({});
  cryptoPaymentMethods:any=[];

  range = (start, stop, step) => Array.from({ length: (stop - start) / step + 1 }, (_, i) => start + (i * step));

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private httpService: HttpService,
    private activeModal: NgbActiveModal,
    private alertService: AlertService,
    private translate: TranslateService,
    private headerService: HeaderService,
    private userService:UserService,
    private scriptService:ScriptLoaderService,
    private converCurrency: CurrencyConverterPipe,
    private router:Router,
    private modalService:ModalService,
    private sharedService:SharedService,
    private restrictionService:RestrictionsService,
    private sanitizer:DomSanitizer
  ) {
    this.errorHandler = this.errorHandler.bind(this);
  }

  ngOnInit(): void {
    if(this.statusData) {
      this.step = 3;
      return;
    }

    this.show100 = true;
    this.withdrawalValue = 100;
    this.methodClicked = false;
    this.currency = this.authService.getUserData('currency');
    this.dropDownCurrency = []

    this.initForm();
    this.getAPIData();
    this.headerService.headerData.subscribe((res) => {
      if(res) {
        if(res.currencies) {
          this.allCurrencies = res.currencies;
        }
        this.balanceData = res.playerAccounts;
        this.currency = this.authService.getUserData(USER_DETAILS.Currency);



        this.httpService.getData(`${APIS.PLAYER.ACCOUNTS}?compatibility=false`).subscribe(res => {
          let playersDetailedAccountInfo = res.body;
          for (let j = 0; j < this.balanceData.length; j++) {
            if (this.currency == this.balanceData[j].currency) {
              this.balance = this.balanceData[j]?.amount_cents;
              if (playersDetailedAccountInfo) {
                for (let i = 0; i < playersDetailedAccountInfo.length; i++) {
                  if (playersDetailedAccountInfo[i]?.currency == this.balanceData[j]?.currency) {
                    this.balanceData.splice(j, 1, playersDetailedAccountInfo[i]);
                    this.withdrawable = parseInt(this.balanceData[i]?.available_to_cashout_cents);
                    this.lockedByBonus = (this.balanceData[i]?.amount_cents - this.balanceData[i]?.available_to_cashout_cents);
                    this.form.patchValue({ currency: this.balanceData[i]?.currency })
                    this.transformBalance(this.balanceData[i]?.amount_cents, this.currency);
                    break;
                  }
                }
              }
              // break;

            }
            this.dropDownCurrency.push(this.balanceData[j].currency);

          }
          this.dropDownCurrency=this.dropDownCurrency.filter((item) => !this.restrictionService.currencies.includes(item));
        });


      }
    });

  }
  /** -- function to initialize the form */

  transformBalance(value, currency) {
    if(this.allCurrencies) {
      let currencyData = this.allCurrencies.find((obj) => {
        return obj.code == currency;
      });
      // return currencyData?(+this.balanceData[i].amount_cents)/(+currencyData.subunits_to_unit): this.balanceData[i].amount_cents;

      this.form.patchValue({ balanceAmount: currencyData ? (+value) / (+currencyData.subunits_to_unit) : value })
    }
  }


  getCurrencyTransformedValue(value){
    return this.converCurrency.transform(value, [this.currency, this.allCurrencies]);
  }

  initForm() {
    this.form = this.formBuilder.group({
      amount: [this.withdrawalValue, [Validators.required]],
      balanceAmount: [this.balance, [Validators.required]],
      currency: [this.currency],
      email: [this.email],
      // encCreditcardNumber: [],
      // cardHolder: [],
      // account_type:[],
      // expiry_date: this.formBuilder.group({
      //   expiryMonth: [],
      //   expiryYear: [],
      //   month: [],
      //   year: []
      // }),
      // cvv: [],
      phone: [this.phoneNo],
      // pan: [this.panNo]
    });
  }

  getAPIData() {
    let apiCalls = [
      this.httpService.getData(`${APIS.PAYMENTS.PAYMENT_METHODS}/${this.currency}`),
      this.httpService.getData(APIS.PLAYER.DATA),
      this.httpService.getData(APIS.PAYMENTS.PAYMENT_ACCOUNTS, { kind: "cashout" }),
      this.httpService.getData(APIS.USER_LIMITS),
      // this.httpService.getData(APIS.CURRENCIES),
      this.httpService.getData(APIS.PAYMENTS.HISTORY)
    ]

    forkJoin(apiCalls).subscribe((res) => {
      this.paymentMethods = ((res[0] || {}).body || {}).methods || Payment_Methods.methods;
      let providers= ((res[0] || {}).body || {}).providers;
      this.getAvailableMethods(providers)

      this.authService.updateUserDetails((res[1] || {}).body)

      this.playerData = (res[1] || {}).body;
      this.recentUsedMethods = (res[2] || {}).body;
      // this.allCurrencies = (res[4] || {}).body;
      this.sharedService.isCurrenciesUpdated.subscribe((res)=>{
        this.allCurrencies=this.sharedService.allCurrencies;
    })
      this.pendingWithdrawal=this.getPendingWithdrawal((res[5] || {}).body)

      // console.log("this.paymentMethods in wallet withdraw2: ", this.paymentMethods, this.pendingWithdrawal)
    });
  }

  close(value?) {
    this.activeModal.close();
  }

  get controls() {
    return this.form.controls;
  }

  getUrl(method,i?) {
    // return `${environment.imgBaseURL}${URLS.PAYMENT_LOGO}/${method.provider}-${method.brand}.svg`;

    switch (method.brand) {
      // case 'bank':
      //   return `${environment.imgBaseURL}${URLS.PAYMENT_LOGO}/${method.provider}-banklocal.svg`;
      case 'ideal':
        return `${environment.imgBaseURL}${URLS.PAYMENT_LOGO_WHITE}/${method.brand}.svg`;
        case 'coinspaid':
          return `${environment.imgBaseURL}${URLS.PAYMENT_LOGO_WHITE}/${this.paymentMethods[i]?.cashout_form_fields?.config?.original_currency}_${method.brand}.svg`;
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

  getTwoDigitNumber(d) {
    return (+d < 10 && d.length == 1 ? '0' : '') + String(d);
  }

  // async getAvailableMethods(providers) {
  //   let filteredMethods = [...this.paymentMethods];
  //   await providers.forEach((provider) => {
  //     if (provider?.config?.available_cashouts_url) {
  //       this.httpService.get(provider?.config?.available_cashouts_url).subscribe((res: any) => {
  //         if (res?.methods) {
  //           res.methods.forEach(method => {
  //             if (method?.service) {
  //               let brandIndex = this.paymentMethods.findIndex((el) => { return el.brand.toLowerCase() == method?.providerType.toLowerCase() })
  //               if (brandIndex > -1) {
  //                 let pymentmethod = Object.assign({}, this.paymentMethods[brandIndex]);
  //                 pymentmethod.brand = method?.service.toLowerCase();
  //                 pymentmethod['service'] = method?.service;
  //                 if (filteredMethods[brandIndex].brand == this.paymentMethods[brandIndex].brand) {
  //                   filteredMethods.splice(brandIndex, 1)
  //                 }
  //                 filteredMethods.push(pymentmethod);


  //                 // this.paymentMethods[brandIndex].brand=method?.service.toLowerCase();
  //                 // this.paymentMethods[brandIndex]['service']=method?.service;
  //                 // this.paymentMethods[brandIndex]['deposit']['max']=method?.limit?.max
  //                 // this.paymentMethods[brandIndex]['deposit']['min']=method?.limit?.min
  //               }
  //             }
  //           })
  //         }
  //       })
  //       this.paymentMethods = [...filteredMethods]
  //       let bank = this.paymentMethods.findIndex((method) => {
  //         return method.brand == 'bank';
  //       });
  //       if (bank > -1) {
  //         this.paymentMethods.splice(bank, 1)
  //       }
  //       this.paymentMethods = this.paymentMethods.filter((method) => {
  //         if (method.brand == 'creditcard' && this.userService.country == 'NO') {
  //           return false;
  //         } else {
  //           return  method.cashout && method.cashout_form_fields && _.find(providers,{provider:method.provider}) && !_.find(this.discardedMethods, {brand:method.brand,provider:method.provider}) && (['sofort','ideal','trustly','interac'].includes(method.brand)?ONLY_ALLOWED_PAYMENT_PROVIDERS[method.brand]?.includes(this.userService.country):true) ;
  //         }
    
  //         // return method.deposit && !_.find(this.discardedMethods, { brand: method.brand, provider: method.provider });;
  //       });
  //       this.sortMethods(this.paymentMethods);
  //     }
  //     else {
  //       let methods = provider?.methods;
  //       let apiCalls = [];
  //       let keys = Object.keys(provider?.config);
  //       keys.forEach((key) => {
  //         let req = this.httpService.postData(`${APIS.PAYMENTS.PAYMENT_METHODS}/${this.currency}/${methods[0]}/cashout_info`, { currency: key })
  //         apiCalls.push(req)
  //       });
  //       forkJoin(apiCalls).subscribe(results => {
  //         console.log(results)
  //         this.cryptoPaymentMethods = [...results]
          
  //         this.paymentMethods=this.paymentMethods.concat(results)
  //         this.paymentMethods=this.paymentMethods.filter((method) => {
  //           let loaded=true;
  //           if(method?.cashout_form_fields?.loaded==false){
  //             loaded=false
  //           }
  //           return loaded;
  //         });

  //       });
  //     }
  //   })
  // }

  async getAvailableMethods(providers) {
    let filteredMethods = [...this.paymentMethods];
    this.getMethodConfigs(providers,filteredMethods).then((res)=>{
      // this.paymentMethods = [...filteredMethods,...this.cryptoPaymentMethods]
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
            return  method.cashout && method.cashout_form_fields && _.find(providers,{provider:method.provider}) && !_.find(this.discardedMethods, {brand:method.brand,provider:method.provider}) && (['sofort','ideal','trustly','interac'].includes(method.brand)?ONLY_ALLOWED_PAYMENT_PROVIDERS[method.brand]?.includes(this.userService.country):true) ;
          }
        // return method.deposit && !_.find(this.discardedMethods, { brand: method.brand, provider: method.provider });;
      });
      // this.sortMethods(this.paymentMethods);
      this.paymentMethods=[...this.paymentMethods,...this.cryptoPaymentMethods];
      // console.log('-----------++++++_--------------[',this.paymentMethods.length)
      this.paymentMethods=this.paymentMethods.filter((method) => {
        let loaded=true;
        if(method?.cashout_form_fields?.loaded==false){
          loaded=false
        }
        return loaded;
      });
    })

  }

  getMethodConfigs(providers,filteredMethods){
    // console.log("=======providers",providers,filteredMethods)
    return new Promise((resolve,reject)=>{
      let isFiltered=false;
      providers.forEach(async (provider,index) => {
        if (provider?.config?.available_cashouts_url) {
          this.paymentMethods=await this.getPaymentConfigs(provider,filteredMethods);
          // console.log('this.paymentMethods========>',this.paymentMethods)

          isFiltered=true;

          if(this.cryptoPaymentMethods.length>0 && providers.length>1){
            resolve(true)
          }
          else if(providers.length==1 ){
            resolve(true);
          }
          // console.log("caase11111")
        }
        
        else {
          this.cryptoPaymentMethods=await this.getCryptoMethods(provider);
          // console.log('this.cryptoPaymentMethods========>',this.cryptoPaymentMethods)
          if(isFiltered && providers.length>1){
            resolve(true)
          }
          else if(providers.length==1){
            resolve(true);
          }
          // console.log("caase22222")
        } 
      });
     
    })
  }

  getPaymentConfigs(provider,filteredMethods){
    return new Promise((resolve,reject)=>{
      this.httpService.get(provider?.config?.available_cashouts_url).subscribe((res: any) => {
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
    // console.log("get crypto methods",provider)
    return new Promise((resolve,reject)=>{
      let methods = provider?.methods;
      let apiCalls = [];
      let keys = Object.keys(provider?.config);
      keys.forEach((key) => {
        let req = this.httpService.postData(`${APIS.PAYMENTS.PAYMENT_METHODS}/${this.currency}/${methods[0]}/cashout_info`, { currency: key })
        apiCalls.push(req)
      });
      forkJoin(apiCalls).subscribe(results => {
        // console.log(results)
        // this.cryptoPaymentMethods = [...results]
        resolve(results);

      });
    })
  }


  sortMethods(methods) {
    this.httpService.getData(APIS.CURRENT_IP).subscribe((res) => {
      let modifiedArray = [];
      let ip = res?.body?.country_code;
      let sortData = SORT_PAYMENT_METHODS[ip];
      if(sortData) {
        sortData.forEach(element => {
          let index = methods.findIndex(el => {
            return el.brand == element;
          })
          if(index > -1) {
            modifiedArray.push(methods[index]);
          }
        });
        methods.forEach(element => {
          let index = modifiedArray.findIndex((item) => { return item.brand == element.brand });
          if(index < 0) {
            modifiedArray.push(element)
          }
        });
        this.paymentMethods = [...modifiedArray]
      }
    })
  }

  get formControls() {
    // console.log(this.form.controls)
    return this.form.controls;
  }


  getPendingWithdrawal(withdrawals) {
    let pending;
    if(withdrawals?.length>0) {
    pending=withdrawals.find((res)=>{
      return res?.action=="cashout" && !res?.success && !res.finished_at && res.recallable;
    })
  }
    return pending;
    
  }

  // processPayment(method) {
  processPayment(data) {

    // if (this.controls.amount.value >= (+this.methodData?.cashout?.min) && this.controls.amount.value <= (+this.methodData?.cashout?.max)) {
    //   this.invalidAmountMessage = '';
    //   this.invalidAmount = false;
    //   let data = {
    //     amount: parseFloat(this.controls.amount.value).toFixed(2).toString(),
    //     currency: this.currency,
    //     payment_action: "cashout",
    //     payment_method: this.methodData.id,
    //     //TODO: for handling deposits payment
    //     custom_routes: PAYMENT_CUSTOM_ROUTES,
    //     NeoSurfEmail: this.controls.email.value,
    //     accountId: this.controls.email.value,
    //     recipient: this.controls.email.value,
    //     phone: parseInt(this.controls.phone.value)
    //   }

    //   // {"payment_method":"mbp-13","currency":"BTC","payment_action":"cashout","amount":0.001,"recipient":"1L5Yz6eh6JQUMHJc2oanWtE8QYQm1jAokt"}
    //   this.httpService.postData(`${APIS.PAYMENTS.PAYMENT_PROCESSING}`, data).subscribe((paymentDetails: any) => {
    //     this.initPayment(paymentDetails);
    //     // this.activeModal.close();
    //     // this.router.navigate(['/payment/success']);
    //   }, this.errorHandler);

    // } else {
    //   this.invalidAmount = true;
    //   if (this.controls.amount.value < (+this.methodData?.cashout?.min)) {
    //     this.invalidAmountMessage = this.getMessages(FORM_VALIDATION.AMOUNT_LESS_THAN_REQUIRED);
    //   }
    //   if (this.controls.amount.value > (+this.methodData?.cashout?.max)) {
    //     this.invalidAmountMessage = this.getMessages(FORM_VALIDATION.AMOUNT_EXCEEDING_LIMIT);
    //   }
    // }

    data = { ...data, payment_method: this.selectedMethod.id, custom_routes: PAYMENT_CUSTOM_ROUTES, currency: this.currency, payment_action:'cashout' };
    this.httpService.postData(`${APIS.PAYMENTS.PAYMENT_PROCESSING}`, data).subscribe((paymentDetails: any) => {
      this.initPayment(paymentDetails);
    }, this.errorHandler);

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
        // if(res['txState']=='WAITING_INPUT') {
        //   if(res['redirectOutput']) {
        // if(res['redirectOutput']['url']) {
        //       this.generateForm(res['redirectOutput']['url'],res['redirectOutput']['parameters'],res['redirectOutput']['method'],res['redirectOutput']['container'])
        //     }
        //     else if(res['redirectOutput']['html']){
        //       let form = document.createElement('form');
        //       form.method = res['redirectOutput']['html']; // Set method to post by default if not specified.
        //       form.className='form'
        //       form.target = 'hidden-iframe'
        //       this.modalService.openModal(IframeComponent, {html:res['redirectOutput']['html'],container:res['redirectOutput']['container'],form:form})
        //     }
        //   }
        // }
        // if(res['txState']=='SUCCESS') {
        //   this.addGtagScript();
        //   this.modalService.openModal(MyProfileComponent,{goToHistory:true});
        //  }
        
      },this.errorHandler)
    }

  initPayment(paymentData) {
    this.headerService.fetchData();
    this.headerService.isUpdateAccount.next(true)
    switch (paymentData.mode) {
      case 'notify':
        this.title = "Processing";
        this.successMessage = this.getMessages(MESSAGES.SUCCESS.REQUEST_ACCEPTED);
        this.step = 3;
        break;

      case 'redirect':
        this.step=5;
        // window.location.href = paymentData.url;
        this.getIframe(paymentData?.url ,'redirect')
        break;

      case 'page_redirect':
        // let formData = new FormData();
        // formData.append("params", paymentData.options.data.params);
        // this.httpService.post(paymentData.options.url, formData).subscribe(paymentDetails => {
        // });
        this.modalService.openModal(IframeComponent, {src:paymentData.options.url, params:paymentData.options.data,container:'page-redirect'});
        break;

        case 'form_redirect':
          this.modalService.openModal(IframeComponent, { src: paymentData?.options?.url, params: paymentData.options.data, container: 'form_redirect' })
          break;
    }
  }

    /**
   * Submitting form
   */
     submit() {

      if(!this.methodClicked) {
        this.checkCashoutMethodFields(this.methodData, this.selectedWithdrawlMethodIndex);
      }
  
      let data = { ...this.cashoutForm?.value };
      data['amount']=parseFloat(data.amount).toFixed(2).toString()
      // console.log("data: ", data)
      data['amount']=parseFloat(this.withdrawalValue).toFixed(2).toString()
      if(this.methodData?.accountId){
        data['accountId']=this.methodData?.accountId
      }
  
      let cashoutFields = this.selectedMethod?.cashout_form_fields;
      if(cashoutFields?.config) {
        if(cashoutFields?.config?.additional_params) {
          data = { ...data, ...cashoutFields?.config?.additional_params, custom_routes: PAYMENT_CUSTOM_ROUTES };
        }
        if(cashoutFields?.config?.encrypt_attributes) {
          this.scriptService.load({ name: "encryption", src: cashoutFields?.config?.encryption_script_url, loaded: false }).subscribe(scriptData => {
            cashoutFields?.config?.encrypt_attributes.forEach(element => {
              data[element] = window['encryptData'](data[element]) || data[element];
              if(cashoutFields?.config?.process_url) {
                this.processPaymentWithURL(data, cashoutFields?.config?.process_url);
              } else {
                this.processPayment(data);
              }
            });
          })
        } else {
          if(cashoutFields?.config?.process_url) {
            this.processPaymentWithURL(data, cashoutFields?.config?.process_url);
          } else {
            this.processPayment(data);
          }
        }
      } else {
        this.processPayment(data);
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

  buildForm(fields) {
    if(fields) {
      fields.forEach((item, i) => {
        if(item.field) {
          if(item.field == 'expiry_date') {
            this.group[item.month] = new FormControl('', this.getValidators(item.validations));
            this.group[item.year] = new FormControl('', this.getValidators(item.validations));
            // let subgroup = {};
            // subgroup[item.month] = new FormControl('', this.getValidators(item.validations));
            // subgroup[item.year] = new FormControl('', this.getValidators(item.validations));
            // this.group[item.field] = new FormGroup(subgroup)
          } else if(item.field == 'country_and_bank'){
            this.group[item.country] = new FormControl('', this.getValidators(item.validations));
            this.group[item.bank_code] = new FormControl('', this.getValidators(item.validations));
          } else {
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
      if(validations) {
        const fieldValidators = Object.keys(validations).map((validator) => {
          if(validator == 'required' || validator == 'email') {
            return Validators[validator];
          } else {
            return Validators[validator](validations[validator]);
          }
        });
        return fieldValidators;
      }
      return;
  
    }

  getName(name, method) {
    switch (name) {
      // case 'bank':
      //   return 'Bank Transfer';
      case 'online_bank_transfer':
        if(method.provider == 'skrill') {
          return 'Skrill Rapid Transfer'
        } else {
          return name.split('_').join(" ");
        }
      default:
        return name.split('_').join(" ");
    }
  }

  back() {
    this.invalidAmount = false;
    this.step--;
  }

  sanitize(url:string){
    return this.sanitizer.bypassSecurityTrustUrl(url);
}

  getMessages(message) {
    return this.translate.instant(message);
  }

  errorHandler(error) {
    let errors = Object.keys(error);
    errors.forEach(key => {
      let titles = Object.keys(error[key]);
      titles.forEach((err) => {
        // this.alertService.error(`${key} ${(error[key][err])}`);
        this.alertService.error((error[key][err]));
      })
    });
  }


  selectedValue(event) {
    this.invalidAmount = false;
    this.withdrawalValue = parseInt(event.target.innerHTML)
    this.form.patchValue({ amount: parseInt(event.target.innerHTML) })
    // this.depositForm.patchValue({ amount: parseInt(event.target.innerHTML) })


    this.valueCheck(event.target.innerHTML);
  }

  onClickingPaymentMethod(method,index){
    this.methodData = method;
    this.methodClicked = true;
    this.selectedWithdrawlMethodIndex = index;
    this.selectedPaymentMethod = index;
    if(method) {
      this.cashoutForm.reset();
      for(const field in this.cashoutForm?.controls){
        this.cashoutForm.removeControl(field);
      }
      this.checkCashoutMethodFields(method,index);
      // this.initPaymentProcessing(method);
    }
  }

    /**
   * Checks if the amount is valid for selected method and send data for initiate payment processing
   * @param method 
   */
     checkCashoutMethodFields(method, index) {
      this.methodClicked = true;
      this.methodData = method;
      this.selectedWithdrawlMethodIndex = index;
  
  
      this.selectedPaymentMethod = index;
      let that = this
      if(that.form.controls?.amount?.value >= (+method?.cashout?.min) && that.form.controls?.amount?.value <= (+method?.cashout?.max)) {
        this.invalidAmountMessage = '';
        this.invalidAmount = false;
      } else {
        this.invalidAmount = true;
        if(that.form.controls?.amount?.value < (+method?.cashout?.min)) {
          this.invalidAmountMessage = this.translate.instant(FORM_VALIDATION.AMOUNT_LESS_THAN_REQUIRED);
        }
        if(that.form.controls?.amount?.value > (+method?.cashout?.max)) {
          this.invalidAmountMessage = this.translate.instant(FORM_VALIDATION.AMOUNT_EXCEEDING_LIMIT);
        }
      }
      if(method) {
        this.initPaymentProcessing(method);
      }
    }

      /**
 * Checks for other required fields for the selected method and moves to next step
 * @param method 
 */
  initPaymentProcessing(method) {
    // if(this.selectedMethodFields?.length>0){
    // this.selectedMethodFields.forEach((item)=>{
    //   this.cashoutForm.removeControl(item?.field);
    // })
    // }
    this.selectedMethod = method;
    if(this.selectedMethod?.service){
      this.selectedMethodFields = this.filterFields(method?.cashout_form_fields?.fields,this.selectedMethod?.service);
    } else{
      this.selectedMethodFields = this.filterFields(method?.cashout_form_fields?.fields);
    }
    this.cashoutForm = this.buildForm(this.selectedMethodFields);

  }

  valueCheck(val) {
    if(val == 100) {
      this.show100 = true;
      this.show200 = false;
      this.show500 = false;
    }
    if(val == 200) {
      this.show200 = true;
      this.show100 = false;
      this.show500 = false;
    }
    if(val == 500) {
      this.show500 = true;
      this.show100 = false;
      this.show200 = false;
    }
  }

  changeCurrency(event) {
    this.form.patchValue({ currency: event.target.innerHTML })

    this.currency = event.target.innerHTML;
    for (var i = 0; i < this.balanceData.length; i++) {
      if (event.target.innerHTML == this.balanceData[i].currency) {
        // this.currency = this.balanceData[0].currency;
        this.withdrawable =  parseInt(this.balanceData[i].available_to_cashout_cents);
        this.lockedByBonus = this.balanceData[i].amount_cents - this.balanceData[i].available_to_cashout_cents;
        this.balance = parseInt(this.balanceData[i].amount_cents);

        this.transformBalance(this.balanceData[i].amount_cents, this.balanceData[i].currency)
        // this.form.patchValue({ balanceAmount: this.balanceData[i].amount_cents });
      }
    }

    this.httpService.getData(`${APIS.PAYMENTS.PAYMENT_METHODS}/${this.currency}`).subscribe(paymentMethods => {
      this.paymentMethods = ((paymentMethods || {}).body || {}).methods || Payment_Methods.methods;
      let providers= ((paymentMethods || {}).body || {}).providers;
      this.getAvailableMethods(providers);
      this.methodData = this.paymentMethods[0];
      // this.selectedWithdrawlMethod(this.methodData, 0);
      this.selectedWithdrawlMethodIndex = 0;
      this.checkCashoutMethodFields(this.methodData,this.selectedWithdrawlMethodIndex)
    })
  }

  withdrawlValueChange(event) {
    // console.log(this.selectedMethod,this.selectedWithdrawlMethodIndex)
    this.withdrawalValue = parseInt(event.target.value);
    this.form.patchValue({ amount: parseInt(event.target.value) });
    this.checkCashoutMethodFields(this.selectedMethod,this.selectedWithdrawlMethodIndex);
    if(this.withdrawalValue != 100 && this.withdrawalValue != 200 && this.withdrawalValue != 500) {
      this.show200 = false;
      this.show100 = false;
      this.show500 = false;
    }
    else {
      this.valueCheck(this.withdrawalValue);
    }
  }

  selectedWithdrawlMethod(method, index) {
    this.methodClicked = true;
    this.selectedWithdrawlMethodIndex = index;
    this.methodData = method;

    if(method?.cashout_form_fields) {
      this.selectedMethodFields = this.filterFields(method?.cashout_form_fields.fields);
    }
    // else if (!method?.cashout_form_fields && method?.deposit_form_fields) {
    //   this.selectedMethodFields = this.filterFields(method?.deposit_form_fields.fields);
    //   console.log("this.selectedMethodFields: ", this.selectedMethodFields)
    // }
    // if (method.deposit_form_fields) {
    //   this.selectedMethodFields = this.filterFields(method?.deposit_form_fields.fields);
    // }

  }

  cancelPendingWithdrawal() {
    this.httpService.postData(`/api/player/payments/${this.pendingWithdrawal.id}/recall`).subscribe((res)=>{
      this.pendingWithdrawal='';
      this.headerService.fetchData();
      this.headerService.isUpdateAccount.next(true)
      this.router.navigate([ROUTING.USER.HISTORY])
    })
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
      if(field.hint) {
        value['hint']=field.hint
      }

      if(field.field == "email" || field.field == "NeoSurfEmail" || field.field == "account") {
        this.email = field?.value;
        // this.form.patchValue({ email: field?.value })
        value['value']=field?.value;
      }
      if(field.field == "phone" || field.field == "phoneNumber") {
        this.phoneNo = field?.value;
        this.form.patchValue({ phone: field?.value })

      }
      if(field?.html_content) {
        fieldsArray.push(field);
      } else {
        switch (field.field) {
          case 'amount':
            // value['label'] = "Amount"
            value['label'] = this.translate.instant("title.withdrawal_sum")
            value['type'] = "number";
            value['step'] = field.step;
            value['validations'] = { min: field?.min || null, max: field?.max || null };
            value['value'] = this.form.controls.amount.value || field?.value || '';
            break;
          case 'NeoSurfEmail':
              value['label'] = "NeoSurfEmail"
              value['type'] = "text";
              value['field'] = "NeoSurfEmail";
              value['validations'] = { pattern: REGEX.EMAIL }
              break;
          case 'email':
            value['label'] = "Email"
            value['type'] = "text";
            value['validations'] = { pattern: REGEX.EMAIL }
            break;
          case 'account':
              value['label'] = "Email"
              value['type'] = "text";
              value['field'] = "account";
              value['validations'] = { pattern: REGEX.EMAIL }
              break;
          case 'service':
            value['label'] = "Bank services"
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
          case 'pan':
            value['label'] = "PAN"
            value['type'] = "pan";
            value['field'] = "pan";
            // value['validations'] = { pattern: REGEX.EMAIL }
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
            value['type'] = 'cardHolder',
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
              value['label'] = "Address"
              value['currency'] = field?.currency
              value['type'] = field?.type
              value['validations'] = {
                required: true,
              }
              value['original_currency']=field?.original_currency
            break;
            default:
              if(field.field=='account_identifier'){
                value['label']='IBAN';
              }
              else if(field.field=='swift'){
                value['label']='BIC/SWIFT';
              } else {
              value['label']= field?.label || field?.field.split('_').join(" ");
              }
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

  onAmountChange(){
    this.cashoutForm.get('amount').setValue(this.withdrawalValue)
  }

  getExpiryYear(method) {
    let range=[];
    // if (!method.show_full_year) {
    //   this.currentYear = +(new Date().getFullYear().toString().substr(-2));
    // } else {
    //   this.currentYear = +(new Date().getFullYear())
    // }
    // let range = this.range(this.currentYear, this.currentYear + 15, 1);
    // return range;
    for(let i=0;i<=10;i++) {
      range.push(+(new Date().getFullYear()+i))
    }
    return range;

  }


}

