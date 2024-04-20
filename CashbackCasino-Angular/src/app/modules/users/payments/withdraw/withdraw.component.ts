import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { AuthService, HttpService, AlertService, ModalService, SharedService } from 'src/app/core/services';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { APIS, URLS, FORM_VALIDATION, MESSAGES, PAYMENT_CUSTOM_ROUTES, DISCARDED_PAYMENT_METHODS, ONLY_ALLOWED_PAYMENT_PROVIDERS, REGEX, SORT_PAYMENT_METHODS } from 'src/app/common/constants';
import { Payment_Methods } from 'src/app/core/mocks/payment-methods';
import { forkJoin } from 'rxjs';
import { environment } from 'src/environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { ScriptLoaderService } from 'src/app/core/services/script.service';
import { UserService } from 'src/app/core/services/user.service';
import { IframeComponent } from 'src/app/modules/shared/iframe/iframe.component';
import { MyProfileComponent } from '../../my-profile/my-profile.component';
import * as _ from 'lodash';
import { HeaderService } from 'src/app/core/services/header.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'withdraw',
    templateUrl: './withdraw.component.html',
    styleUrls: ['./withdraw.component.scss']
})
export class WithdrawComponent implements OnInit {

    form: FormGroup;
    methodData;
    providers = [];
    step;
    depositAmount;
    isDeposits;
    show: Boolean = false;
    closeModal: Boolean = false;
    currency;
    paymentMethods = [];
    recentUsedMethods = [];
    successMessage;
    selectedPaymentMethod = false;
    methodClicked = false;
    selectedWithdrawlMethodIndex = -1;
    selectedMethod;
    bonusTypes = [];
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
    cashoutForm: FormGroup;
    STEPS={
        AMOUNT:1,
        PAYMENT_METHODS:2,
        PAYMENT_DETAILS:3,
        STATUS:4
      }
      cryptoPaymentMethods=[]
    range = (start, stop, step) => Array.from({ length: (stop - start) / step + 1 }, (_, i) => start + (i * step));
    constructor(
        private formBuilder: FormBuilder,
        private authService: AuthService,
        private httpService: HttpService,
        private router: Router,
        private activeModal: NgbActiveModal,
        private alertService: AlertService,
        private ngModal: NgbModal,
        private scriptService: ScriptLoaderService,
        private translate: TranslateService,
        private modalService: ModalService,
        private userService: UserService,
        private headerService:HeaderService,
        private sharedService:SharedService,
        private sanitizer:DomSanitizer
    ) {
        this.errorHandler = this.errorHandler.bind(this);
    }

    ngOnInit(): void {
        if (this.statusData) {
            this.step = this.STEPS.STATUS;
            return;
        } else {
            this.step = this.STEPS.AMOUNT;
        }
        this.currency = this.authService.getUserData('currency') || 'EUR';
        this.initForm();
        this.getAPIData();
    }
    /** -- function to initialize the form */
    initForm() {
        this.form = this.formBuilder.group({
            amount: ['', [Validators.required]],
            currency: [this.currency],
            email: [],
            contactNumber: []
        });
    }

    getExpiryYear(method) {
        let range = [];
        // if (!method.show_full_year) {
        //   this.currentYear = +(new Date().getFullYear().toString().substr(-2));
        // } else {
        //   this.currentYear = +(new Date().getFullYear())
        // }
        // let range = this.range(this.currentYear, this.currentYear + 15, 1);
        for (let i = 0; i <= 10; i++) {
            range.push(+(new Date().getFullYear() + i))
        }
        return range;

    }


    getAPIData() {
        let apiCalls = [
            this.httpService.getData(`${APIS.PAYMENTS.PAYMENT_METHODS}/${this.currency}`),
            this.httpService.getData(APIS.PLAYER.DATA),
            this.httpService.getData(APIS.PAYMENTS.PAYMENT_ACCOUNTS, { kind: 'cashout' }),
            this.httpService.getData(APIS.USER_LIMITS),
            // this.httpService.getData(APIS.CURRENCIES)
        ]

        forkJoin(apiCalls).subscribe((res) => {
            this.authService.updateUserDetails((res[1] || {}).body)
            this.paymentMethods = ((res[0] || {}).body || {}).methods || Payment_Methods.methods;

            this.providers = ((res[0] || {}).body || {}).providers;
            this.getAvailableMethods(this.providers);
            // console.log("========payments=====",this.paymentMethods)
            this.playerData = (res[1] || {}).body;
            // this.recentUsedMethods = (res[2] || {}).body;
            // this.allCurrencies = (res[4] || {}).body;
            this.sharedService.isCurrenciesUpdated.subscribe((res)=>{
                this.allCurrencies=this.sharedService.allCurrencies;
            })
        });

        // this.httpService.getData(APIS.PLAYER.DEPOSIT_BONUSES).subscribe((res) => {
        //   this.bonusTypes = (res || {}).body;
        // });
    }

    stepSkip() {
        if (this.step == 1 && this.methodData) {
            this.checkCashoutMethodFields(this.methodData, this.selectedWithdrawlMethodIndex);
        } else {
            this.step++;
        }

    }

    getTranslatedText(text) {
        return this.translate.instant(text);

    }

    sanitize(url:string){
        return this.sanitizer.bypassSecurityTrustUrl(url);
    }


    async getAvailableMethods(providers) {
        let filteredMethods = [...this.paymentMethods];
        await providers.forEach((provider) => {
          if (provider?.config?.available_cashouts_url) {
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
    
    
                      // this.paymentMethods[brandIndex].brand=method?.service.toLowerCase();
                      // this.paymentMethods[brandIndex]['service']=method?.service;
                      // this.paymentMethods[brandIndex]['deposit']['max']=method?.limit?.max
                      // this.paymentMethods[brandIndex]['deposit']['min']=method?.limit?.min
                    }
                  }
                })
              }
            })
            this.paymentMethods = [...filteredMethods]
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
                return method.cashout && method.cashout_form_fields && _.find(providers,{provider:method.provider}) && !_.find(this.discardedMethods, { brand: method.brand, provider: method.provider }) && (['sofort', 'ideal', 'trustly', 'interac'].includes(method.brand) ? ONLY_ALLOWED_PAYMENT_PROVIDERS[method.brand]?.includes(this.userService.country) : true);
            }
        
              // return method.deposit && !_.find(this.discardedMethods, { brand: method.brand, provider: method.provider });;
            });
            this.sortMethods(this.paymentMethods);
          }
          else {
            let methods = provider?.methods;
            let apiCalls = [];
            let keys = Object.keys(provider?.config);
            keys.forEach((key) => {
              let req = this.httpService.postData(`${APIS.PAYMENTS.PAYMENT_METHODS}/${this.currency}/${methods[0]}/cashout_info`, { currency: key })
              apiCalls.push(req)
            });
            forkJoin(apiCalls).subscribe(results => {
            //   console.log(results)
              this.cryptoPaymentMethods = [...results]
              
              this.paymentMethods=this.paymentMethods.concat(results)
              this.paymentMethods=this.paymentMethods.filter((method) => {
                let loaded=true;
                if(method?.deposit_form_fields?.loaded==false){
                  loaded=false
                }
                return loaded;
              });
    
            });
          }
        })
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
        if (that.form.controls?.amount?.value >= (+method.cashout.min) && that.form.controls?.amount?.value <= (+method.cashout.max)) {
            this.invalidAmountMessage = '';
            this.invalidAmount = false;
            if (method) {
                this.initPaymentProcessing(method);
            }
        } else {
            this.invalidAmount = true;
            if (that.form.controls?.amount?.value < (+method.cashout.min)) {
                this.invalidAmountMessage = this.translate.instant(FORM_VALIDATION.AMOUNT_LESS_THAN_REQUIRED);
            }
            if (that.form.controls?.amount?.value > (+method.cashout.max)) {
                this.invalidAmountMessage = this.translate.instant(FORM_VALIDATION.AMOUNT_EXCEEDING_LIMIT);
            }
        }
    }

    /**
   * Checks for other required fields for the selected method and moves to next step
   * @param method 
   */
    initPaymentProcessing(method) {
        if (this.selectedMethodFields.length > 0) {
            this.selectedMethodFields.forEach((item) => {
                this.cashoutForm.removeControl(item?.field);
            })
        }
        this.selectedMethod = method;
        this.selectedMethodFields = this.filterFields(method?.cashout_form_fields.fields);
        this.cashoutForm = this.buildForm(this.selectedMethodFields);
        if (this.selectedMethodFields.length >= 1) {
            this.step = this.STEPS.PAYMENT_DETAILS;
        } else {
            this.processPayment(this.form.value);
        }
    }


    /**
   * Submitting form
   */
    submit() {

        if (!this.methodClicked) {
            this.checkCashoutMethodFields(this.methodData, this.selectedWithdrawlMethodIndex);
        }

        let data = { ...this.cashoutForm?.value };
        // console.log("data: ", data)
        data['amount'] = parseFloat(this.formControls.amount.value).toFixed(2).toString()
        if(this.methodData?.accountId){
            data['accountId']=this.methodData?.accountId
          }

        let cashoutFields = this.selectedMethod?.cashout_form_fields;
        if (cashoutFields?.config) {
            if (cashoutFields?.config?.additional_params) {
                data = { ...data, ...cashoutFields?.config?.additional_params, custom_routes: PAYMENT_CUSTOM_ROUTES };
            }
            if (cashoutFields?.config?.encrypt_attributes) {
                this.scriptService.load({ name: "encryption", src: cashoutFields?.config?.encryption_script_url, loaded: false }).subscribe(scriptData => {
                    cashoutFields?.config?.encrypt_attributes.forEach(element => {
                        data[element] = window['encryptData'](data[element]) || data[element];
                        if (cashoutFields?.config?.process_url) {
                            this.processPaymentWithURL(data, cashoutFields?.config?.process_url);
                        } else {
                            this.processPayment(data);
                        }
                    });
                })
            } else {
                if (cashoutFields?.config?.process_url) {
                    this.processPaymentWithURL(data, cashoutFields?.config?.process_url);
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
        if (this.selectedMethod.service) {
            data['service'] = this.selectedMethod.service;
        }
        this.httpService.post(url, data).subscribe((res) => {
            if (res['txState'] == 'FAILED') {
                this.errorHandler(res['errors'])
            }
            if (res['txState'] == 'WAITING_INPUT') {
                if (res['redirectOutput']) {
                    if (res['redirectOutput']['url']) {

                        if (res['redirectOutput']['method'] == 'GET') {

                            this.generateForm(res['redirectOutput']['url'], res['redirectOutput']['parameters'], res['redirectOutput']['method'], res['redirectOutput']['container'])
                            // window.top.location.href = res['redirectOutput']['url']
                            // this.getIframe(res['redirectOutput']['url'],res['redirectOutput']['height'],res['redirectOutput']['width'])
                        }
                        if (res['redirectOutput']['method'] == 'POST') {


                            this.generateForm(res['redirectOutput']['url'], res['redirectOutput']['parameters'], res['redirectOutput']['method'], res['redirectOutput']['container'])
                            // this.getIframe(res['redirectOutput']['url'], res['redirectOutput']['height'], res['redirectOutput']['width'])
                        }
                    } else if (res['redirectOutput']['html']) {
                        let form = document.createElement('form');
                        form.method = res['redirectOutput']['html']; // Set method to post by default if not specified.
                        form.className = 'form'
                        form.target = 'hidden-iframe'
                        this.modalService.openModal(IframeComponent, { html: res['redirectOutput']['html'], container: res['redirectOutput']['container'], form: form })
                    }
                }
            }
            if (res['txState'] == 'SUCCESS') {
                this.modalService.openModal(MyProfileComponent, { goToHistory: true });
            }
        }, this.errorHandler)
    }



    generateForm(path, params, method, container) {
        let form = document.createElement('form');
        form.method = method || "post"; // Set method to post by default if not specified.
        form.action = path;
        form.className = 'form'
        form.target = '_self'
        if (container == 'page-redirect') {
            form.enctype = "multipart/form-data"
        }

        for (let key in params) {
            if (params.hasOwnProperty(key)) {
                let input = document.createElement('input');
                input.name = key;
                input.value = params[key]
                form.appendChild(input);
            }
        }
        if (method == 'POST') {
            this.modalService.openModal(IframeComponent, { src: path, form: form, container: container })
        }
        else {
            document.body.appendChild(form);
            window.top.location.href = path
            // this.modalService.openModal(IframeComponent, {src:path, form:form,submit:true})
        }
        // document.body.appendChild(form);
    }

    /**
     * Process payment with payment API
     * @param data 
     */
    processPayment(data) {
        data = { ...data, payment_method: this.selectedMethod.id, custom_routes: PAYMENT_CUSTOM_ROUTES, currency: this.currency, payment_action: 'cashout' };
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
        switch (paymentData.mode) {
            case 'notify':
                this.title = "Processing";
                this.successMessage =  paymentData.message || this.getMessages(MESSAGES.SUCCESS.REQUEST_ACCEPTED);
                this.step = this.STEPS.STATUS;
                break;

            case 'redirect':
                // window.location.href = paymentData.url;
                this.generateForm(paymentData?.url ,{params:paymentData?.options?.data?.params},'POST','redirect')
                break;

            case 'page_redirect':
                // let formData = new FormData();
                // formData.append("params", paymentData.options.data.params);
                this.generateForm(paymentData.options.url, { params: paymentData.options.data.params }, paymentData.options.data.method, 'page-redirect')
            // this.getIframe(paymentData.options.url)
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
            let value = {};
            value['field'] = field.field;
            value['value'] = field?.value || '';
            if (field.hint) {
                value['hint'] = field.hint
            }

            if (field.field == "email" || field.field == "NeoSurfEmail" || field.field == "account") {
                // this.email = field?.value;
                this.form.patchValue({ email: field?.value })
                value['value'] = field?.value;
            }
            if (field.field == "phone" || field.field == "phoneNumber") {
                // this.phoneNo = field?.value;
                this.form.patchValue({ contactNumber: field?.value })

            }
            if (field?.html_content) {
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
                        value['label'] = "Account"
                        value['type'] = "text";
                        value['field'] = "account";
                        value['validations'] = { pattern: REGEX.EMAIL }
                        break;
                    case 'service':
                        value['label'] = "Bank services"
                        value['type'] = 'select';
                        value['placeholder'] = "Select your bank"
                        // value['validations']={required:true};
                        value['options'] = field?.options;
                        break;
                    case 'account_type':
                        value['label'] = "Account type"
                        value['type'] = 'select';
                        value['placeholder'] = "Select type"
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
                        value['country'] = field.primary,
                            value['bank_code'] = field.secondary
                        if (field?.values) {
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
                            value['currency'] = field?.currency
                            value['label'] = 'Address'
                            value['type'] = field?.type
                            value['validations'] = {
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
                        // let subgroup={};
                        // subgroup[item.month] = new FormControl('', this.getValidators(item.validations));
                        // subgroup[item.year] = new FormControl('', this.getValidators(item.validations));
                        // this.group[item.field]=new FormGroup(subgroup)
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
    getUrl(method) {
        switch (method.brand) {
            case 'bank':
                //   return `${environment.imgBaseURL}${URLS.PAYMENT_LOGO}/${method.provider}-sofort.svg`;
                return ''
            case 'webredirect':
                return `${environment.imgBaseURL}${URLS.PAYMENT_LOGO}/${method.provider}-sticpay.svg`;
            default:
                if(method.brand!==method.provider)
                return `${environment.imgBaseURL}${URLS.PAYMENT_LOGO}/${method.provider}-${method.brand}.svg`;
                else
                return `${environment.imgBaseURL}${URLS.PAYMENT_LOGO_WHITE}/${method.provider}.svg`;
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


    goTo(path) {
        this.router.navigate([path]);
        this.activeModal.close()
    }

    back() {
        this.invalidAmount = false;
        this.step--;
    }

    myProfile() {
        let profileModal = this.ngModal.open(MyProfileComponent, {
            size: 'lg',
            centered: true,
            backdrop: 'static',
            keyboard: false,
        });
        profileModal.componentInstance.goToDeposits = true;
    }

    getMessages(message) {
        return this.translate.instant(message);
    }


    errorHandler(error) {
        let errors = Object.keys(error);
        errors.forEach(key => {
            let titles = Object.keys(error[key]);
            titles.forEach((err) => {
                // this.alertService.error(`${+key || +key==0?'':key} ${(error[key][err])}`);
                this.alertService.error((error[key][err]));
            })
        });
    }
}