import { Component, OnInit, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { HttpService, AlertService, SharedService, AuthService } from 'src/app/core/services';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { APIS, USER_DETAILS, PAY_N_PLAY_AMOUNT_OPTIONS, MODALS, DEFAULT_VALUES, TRANSACTION_TYPES, PAYMENT_CUSTOM_ROUTES } from 'src/app/common/constants';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash'

@Component({
  selector: 'app-pay-n-play',
  templateUrl: './pay-n-play.component.html',
  styleUrls: ['./pay-n-play.component.scss']
})
export class PayNPlayComponent implements OnInit {

  @Input() content;
  @Input() closeButton;
  @Input() type;
  @Input() pnpType;
  @Input() hidePNP;
  @Output() clicked = new EventEmitter();
  amounts = PAY_N_PLAY_AMOUNT_OPTIONS;
  title;
  data;
  formData;
  apiUrl;
  currenciesField;
  group = {};
  step = 1;
  url="";
  currentIp;
  form: FormGroup;
  mobile;
  submitButton;
  currency;
  paymentMethods;
  depositDetails={};
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.mobile = (window.innerWidth <= DEFAULT_VALUES.MOBILE_SIZE_SMALL) ? true : false;
  }
  constructor(
    private fb: FormBuilder,
    private httpService: HttpService,
    private alertService: AlertService,
    private translate: TranslateService,
    private sharedService: SharedService,
    private authService:AuthService
  ) {
    this.errorHandler = this.errorHandler.bind(this);
  }

  ngOnInit(): void {
    this.mobile = (window.innerWidth <= DEFAULT_VALUES.MOBILE_SIZE_SMALL) ? true : false;
    this.sharedService.hidePNP(this.hidePNP?true:false);
    this.currency = this.authService.getUserData('currency') || 'EUR';
    this.sharedService.currentIP.subscribe((res) => {
      this.currentIp = res;
    })
    this.initForm();

    this.getAPIData();
    if(this.type==MODALS.LOGIN){
      this.submitButton=this.translate.instant('links_text.login');
    } else {
      this.submitButton=this.translate.instant('text.deposit_and_play');
    }
  }

  selectLogin(){
    this.type=MODALS.LOGIN;
    this.selectAmount(0);
    this.onSubmit()
    this.step=2;
    // this.submitButton=this.translate.instant('links_text.login');
  }
  selectSignup(){
    this.step=1;
    this.type=MODALS.SIGNUP;
    this.getAPIData();
    this.selectAmount(50);
    this.submitButton=this.translate.instant('text.deposit_and_play');
  }

  getAPIData() {
    if (this.type !== MODALS.DEPOSIT) {
      this.httpService.getData(APIS.PAY_N_PLAY.SETTINGS).subscribe((res) => {
        if (res) {
          if (this.type == MODALS.LOGIN) {
            this.data = res.body.sign_in;

          } else if (this.type == MODALS.SIGNUP) {
            this.data = res.body.sign_up;
          }
          this.apiUrl = this.data?.payment_system_pay_n_play_form?.url;
          this.formData = this.data?.payment_system_pay_n_play_form?.fields;
          this.currenciesField = this.formData.find((res) => {
            if (res.field == USER_DETAILS.Currency) {
              this.formControls.currency.setValue(res?.options[0]);
            }
            return res.field == USER_DETAILS.Currency;
          })
        }
      })
    }
    else {
      this.httpService.getData(`${APIS.PAYMENTS.PAYMENT_METHODS}/${this.currency}`).subscribe((res) => {
        this.paymentMethods = (res?.body || {}).methods;
        this.getTrustlyDeposit(this.paymentMethods);
      });
    }
  }

  getTrustlyDeposit(methods){
    let trustly=methods.find((res)=>{
      return res?.brand=='trustly';
    })
    if(trustly){
      this.depositDetails['payment_action']=TRANSACTION_TYPES.DEPOSIT;
      this.depositDetails['payment_method']=trustly.id
      this.depositDetails['custom_routes']= PAYMENT_CUSTOM_ROUTES
    }
  }


  selectCurrency(currency) {
    this.formControls.currency.setValue(currency);
  }

  getText(value) {
    return this.translate.instant(value);
  }

  initForm() {
    // this.form = this.buildForm();

    this.form = this.fb.group({
      amount: [(this.type==MODALS.LOGIN)?'0 EUR':'50 EUR'],
      currency: ['EUR', Validators.required]
    })
  }

  buildForm() {
    if (this.formData) {
      this.formData.forEach((item, i) => {
        this.group[item.field] = new FormControl('', Validators.required);
      })
      return new FormGroup(this.group)
    }
  }

  get formControls() { return this.form.controls; }

  selectAmount(value) {
    this.formControls.amount.setValue(`${value} EUR`);
  }

  onSubmit() {
    if(this.type!==MODALS.DEPOSIT){
    let data = { payment_system_pay_n_play_form: this.form.value };
    data['payment_system_pay_n_play_form']['amount'] = parseInt(data['payment_system_pay_n_play_form']['amount'].match(/\d+/g))
    // if (this.currentIp.country_code != "FI") {
    //   data['payment_system_pay_n_play_form']['amount'] = parseInt(data['payment_system_pay_n_play_form']['amount'])
    // }
    // else {
    //   // delete data.payment_system_pay_n_play_form.amount;
    // }
    // data=_.pickBy(data.payment_system_pay_n_play_form, val => ![null, undefined, ''].includes(val));
    this.httpService.postData(this.apiUrl, data).subscribe((res) => {
      if (res) {
        // this.handlePayments(res);
        this.handleRedirect(res);
      }
    }, this.errorHandler);
  } else {
    let data= { ...this.form.value, ...this.depositDetails };
    data['amount']=parseInt(data['amount'].match(/\d+/g));
    this.apiUrl=APIS.PAYMENTS.PAYMENT_PROCESSING;
    this.httpService.postData(this.apiUrl,data).subscribe((paymentDetails)=>{
      this.handlePayments(paymentDetails);
    })
  }
  }

  getValue(){
    return parseInt(this.formControls.amount.value.match(/\d+/g));
  }

  handlePayments(response) {
    switch (response.mode) {
      case 'notify':
        return this.handleNotify();
      case 'redirect':
        return this.handleRedirect(response);
      case 'page_redirect': {
        return this.handlePageRedirect(response);
      }
      //   case 'page': {
      //     const {url, width, height} = response.options;
      //     return openPageInIframe({url, width, height});
      // }
      //   case 'form_redirect':
      //       return handleFormRedirect(response);
      //   case 'polling':
      //       return handlePolling(response, requester);
      default:
        return response;
    }
  }

  handleNotify() {

  }

  handleRedirect(response) {
    this.url = response?.url || ""
    this.step = 2;
    // window.location.href = response.url;
  }

  errorHandler(errs) {
    console.log("err in pnp: ", errs);
    let string = '';
    let errors = [];
    let profileErrors = [];
    errors = Object.keys(errs);
    string = this.getErrorString(errors, errs);
    this.alertService.error(string);
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

  onBlur(event){
    this.formControls.amount.setValue(`${(this.formControls.amount.value.match(/\d+/g))} EUR`);
  }

  handlePageRedirect(response) {
    let formData = new FormData();
    formData.append("params", response.options.data.params);
    this.httpService.post(response.options.url, formData).subscribe(paymentDetails => {
    });
  }

  plus() {

    let intValue=parseInt(this.formControls.amount.value.match(/\d+/g));
    if (!intValue) {
      this.formControls.amount.setValue('10 EUR');
    } else {
      let value = +intValue + this.getInc(intValue);
      // if (value <= 4000) {
      if (value <= 10000) {

        // if (this.amounts[this.amounts.length - 1] + this.getInc(+this.formControls.amount.value) <= 4000 && value > this.amounts[this.amounts.length - 1]) {
        if (this.amounts[this.amounts.length - 1] + this.getInc(intValue) <= 10000 && value > this.amounts[this.amounts.length - 1]) {

          this.amounts.shift();
          this.amounts.push(this.amounts[1] + this.getInc(intValue))
        }
        this.formControls.amount.setValue(`${value} EUR`);
      }
    }
  }

  minus() {
    let intValue=parseInt(this.formControls.amount.value.match(/\d+/g));
    if (intValue > 10) {
      let value = intValue - this.getDec(intValue);
      if (value >= 20) {
        if (this.amounts[0] - this.getDec(intValue) >= 20 && value < this.amounts[0]) {
          this.amounts?.unshift(this.amounts[0] - this.getDec(intValue));
          this.amounts.pop();
        }
        this.formControls.amount.setValue(`${value} EUR`);
      }
    }
  }

  getInc(value) {

    // if (value >= 1000 && value < 2500) {
    //   return 100;
    // }
    // else if (value >= 2500 && value <= 10000) {
    //   return 250;
    // } else if(value>0 && value<=20){
    //   return 30;
    // }
    // else {
    //   return 50;
    // }

    return 10;
  }

  getDec(value) {

    // if (value >= 1000 && value < 2500) {
    //   return 100;
    // }
    // else if (value >= 2500 && value <= 10000) {
    //   return 250;
    // } 
    // else if(value>=30 && value <=50){
    //   return 30;
    // }
    // else {
    //   return 50;
    // }

    if(value<=20){
      return 0;
    } else {
      return 10;
    }
  }

  close() {
    this.sharedService.hidePNP(false);
    this.clicked.emit(true);
  }

}
