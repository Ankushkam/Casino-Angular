import { Component, OnInit } from '@angular/core';
import { HttpService, AuthService, ModalService, SharedService } from 'src/app/core/services';
import { APIS, DISCARDED_PAYMENT_METHODS, MODALS, ONLY_ALLOWED_PAYMENT_PROVIDERS, SORT_PAYMENT_METHODS, URLS } from 'src/app/common/constants';
import { DepositsComponent } from '../deposits/deposits.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { environment } from 'src/environments/environment';
import { WithdrawComponent } from '../withdraw/withdraw.component';
import { RegisterComponent } from 'src/app/modules/auth/register/register.component';
import * as _ from 'lodash';
import { TranslateService } from '@ngx-translate/core';
import { DomSanitizer, Meta, Title } from '@angular/platform-browser';
import { PayNPlayModalComponent } from '../../../shared/pay-n-play-modal/pay-n-play-modal.component';
import { UserService } from 'src/app/core/services/user.service';
import { SignupComponent } from 'src/app/modules/auth/signup/signup.component';

@Component({
  selector: 'app-payment-methods',
  templateUrl: './payment-methods.component.html',
  styleUrls: ['./payment-methods.component.scss']
})
export class PaymentMethodsComponent implements OnInit {

  html: InnerHTML;
  currency;
  loggedIn = false;
  depositMethods = [];
  cashoutMethods = [];
  paymentMethods = [];
  isPNPAllowed: boolean;
  discardedMethods=DISCARDED_PAYMENT_METHODS;
  signup_button=this.translate.instant('links_text.sign_up');
  depositButton=this.translate.instant('links_text.deposit');
  cryptoPaymentMethods=[]
  constructor(
    private httpService: HttpService,
    private authService: AuthService,
    private ngModal: NgbModal,
    private modalService:ModalService,
    private titleService:Title,
    private translate: TranslateService,
    private sharedService:SharedService,
    private userService:UserService,
    private metaService:Meta,
    private sanitizer:DomSanitizer
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle(this.translate.instant('page_titles.payment_methods'))
    this.getCMSData('payments')
    this.authService.authentication.subscribe((res) => {
      this.loggedIn = !!res;
    });
    this.currency = this.authService.getUserData('currency') || 'EUR';
    // this.httpService.getData(`${APIS.PAYMENTS.PAYMENT_METHODS}/${this.currency}`).subscribe((res) => {
    //   let methods=(((res || {}).body || {}).methods);
    //   let providers=(((res || {}).body || {}).providers);
    //   this.filterPaymentMethods(methods,providers);
    // })
    this.filterPaymentMethods()

    this.sharedService.pnpAlowed.subscribe(res=>{
      this.isPNPAllowed=res;
      if(res && this.translate.currentLang=='fi') {
        this.signup_button=this.translate.instant('links_text.sign_up_pnp');
        this.depositButton=this.translate.instant('text.deposit_and_play');
      }
    });
  }

  filterPaymentMethods(){
    this.authService.authentication.subscribe((res)=>{
      this.getPaymentMethods(res)
    })
  }

  getPaymentMethods(auth) {
    this.httpService.getData(`${APIS.PAYMENTS.PAYMENT_METHODS}/${this.currency}`).subscribe((res) => {
      this.paymentMethods=(((res || {}).body || {}).methods);
      let providers=(((res || {}).body || {}).providers);
      if(auth) {
        this.depositMethods = this.paymentMethods.filter((method) => {
          return method.deposit && method.deposit_form_fields ;
        });
        this.cashoutMethods = this.paymentMethods.filter((method) => {
            return method.cashout && method.cashout_form_fields;
          // return method.cashout && method.cashout_form_fields && !_.find(this.discardedMethods, {brand:method.brand,provider:method.provider});;
        });
        this.getAvailableMethods(providers,'deposit',this.depositMethods);
        this.getAvailableMethods(providers,'cashout',this.cashoutMethods);
      } else {
        this.depositMethods = this.paymentMethods.filter((method) => {
          return method.deposit;
        });
        this.cashoutMethods = this.paymentMethods.filter((method) => {
            return method.cashout
        });
      }
    });

  }

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
        return 'MiFinity';
      default:
        return name.split('_').join(" ");
    }
  }

  getUrl(method) {
    switch (method.brand) {
      case 'bank':
        return `${environment.imgBaseURL}${URLS.PAYMENT_LOGO}/${method.provider}-banklocal.svg`;
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
      default:
        if (method.brand !== method.provider)
          return `${environment.imgBaseURL}${URLS.PAYMENT_LOGO}/${method.provider}-${method.brand}.svg`;
        else
          return `${environment.imgBaseURL}${URLS.PAYMENT_LOGO}/${method.provider}.svg`;
    }
  }

  getProcessingTime(time) {
    switch (true) {
      case (time ==='instant'):
        return this.translate.instant('text.instant');
      case _.isObject(time):
        // return `${time.min} to ${time.max} banking days`
        return this.translate.instant('text.banking_days',{min:time.min,max:time.max})
      default:
        return time;
  }
  }

  onSignUp() {
    if(this.isPNPAllowed && !this.loggedIn) {
      let modalRef=this.ngModal.open(PayNPlayModalComponent, {
        size: 'md',
        keyboard: false,
        windowClass: 'pnp-modal',
        centered: true
      });
      modalRef.componentInstance.type=MODALS.SIGNUP;
    } else {
    this.modalService.openModal(SignupComponent);
    }
  }

  openDeposits(method) {
    let depositsModal = this.ngModal.open(DepositsComponent, {
      size: 'lg',
      keyboard: false,
      windowClass: 'modal-active'
    });
    depositsModal.componentInstance.methodData = method;
  }

  openWithdrawals(method) {
    // this.modalService.openModal(WithdrawComponent);
    let modal = this.ngModal.open(WithdrawComponent, {
      size: 'lg',
      keyboard: false,
      windowClass: 'modal-active'
    });
    modal.componentInstance.methodData = method;
  }

  sortMethods(methods,type) {
    // this.httpService.getData(APIS.CURRENT_IP).subscribe((res) => {
      let modifiedArray = [];
      // let ip = res?.body?.country_code;
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
        if(type=='deposit'){
        this.depositMethods = [...modifiedArray];
        }

        if(type=='cashout'){
          this.cashoutMethods=[...modifiedArray];
        }
      }
    // })
  }

  getAvailableMethods(providers,type,methods){
    let availableMethods=[];
    if(type=='deposit') {
    availableMethods = [...this.depositMethods];
    } else{
    availableMethods = [...this.cashoutMethods];
    }
    if(providers) {
    providers.forEach((provider) => {
      let url=(type=='deposit')?provider?.config?.available_deposits_url:provider?.config?.available_cashouts_url
      if(url){
      this.httpService.get(url).subscribe((res:any)=>{
        if(res?.methods) {
          res.methods.forEach(method => {
            if(method?.service) {
              let brandIndex = methods.findIndex((el) => { return el.brand.toLowerCase() == method?.providerType.toLowerCase() })
              if (brandIndex > -1) {
                if(type=='deposit') {

                  let pymentmethod = Object.assign({}, this.depositMethods[brandIndex]);
                  pymentmethod.brand = method?.service.toLowerCase();
                  pymentmethod['service'] = method?.service;
                  if (availableMethods[brandIndex].brand == this.depositMethods[brandIndex].brand) {
                    availableMethods.splice(brandIndex, 1)
                  }
                  availableMethods.push(pymentmethod);
                // this.depositMethods[brandIndex].brand=method?.service.toLowerCase();
                // this.depositMethods[brandIndex]['service']=method?.service;
                // this.paymentMethods[brandIndex]['deposit']['max']=method?.limit?.max
                // this.paymentMethods[brandIndex]['deposit']['min']=method?.limit?.min
                }
                if(type=='cashout') {

                  let pymentmethod = Object.assign({}, this.cashoutMethods[brandIndex]);
                  pymentmethod.brand = method?.service.toLowerCase();
                  pymentmethod['service'] = method?.service;
                  if (availableMethods[brandIndex].brand == this.cashoutMethods[brandIndex].brand) {
                    availableMethods.splice(brandIndex, 1)
                  }
                  availableMethods.push(pymentmethod);
                  // this.cashoutMethods[brandIndex].brand=method?.service.toLowerCase();
                  // this.cashoutMethods[brandIndex]['service']=method?.service;
                  // this.paymentMethods[brandIndex]['cashout']['max']=method?.limit?.max
                  // this.paymentMethods[brandIndex]['cashout']['min']=method?.limit?.min
                  }


            }
          }
        })
      }
        let bank;
        if (type == 'deposit') {
          this.depositMethods=[...availableMethods];
          this.depositMethods = this.depositMethods.filter((method) => {
            if(method.brand=='creditcard' && this.userService.country=='NO'){
              return false;
            } else{
            return !_.find(this.discardedMethods, {brand:method.brand,provider:method.provider}) && (['sofort','ideal','trustly','interac'].includes(method.brand)?ONLY_ALLOWED_PAYMENT_PROVIDERS[method.brand]?.includes(this.userService.country):true) ;
            }
          });
          this.sortMethods(this.depositMethods,'deposit');
          bank = this.depositMethods.findIndex((method) => {
            return method.brand == 'bank';
          });
          if (bank > -1) {
            this.depositMethods.splice(bank, 1)
          }
        } else {
          this.cashoutMethods=[...availableMethods];
          this.cashoutMethods = this.cashoutMethods.filter((method) => {
            if(method.brand=='creditcard' && this.userService.country=='NO'){
              return false;
            } else{
            return !_.find(this.discardedMethods, {brand:method.brand,provider:method.provider}) && (['sofort','ideal','trustly','interac'].includes(method.brand)?ONLY_ALLOWED_PAYMENT_PROVIDERS[method.brand]?.includes(this.userService.country):true) ;
            }// return method.cashout && method.cashout_form_fields && !_.find(this.discardedMethods, {brand:method.brand,provider:method.provider});;
          });
          this.sortMethods(this.cashoutMethods,'cashout')
          let bank1 = this.cashoutMethods.findIndex((method) => {
            return method.brand == 'bank';
          });
          if (bank1 > -1) {
            this.cashoutMethods.splice(bank, 1)
          }
        }
      })
      }
    })
  }
}

getCMSData(page) {
  this.httpService.getData(`${APIS.CMS.PAGES}/${page}`).subscribe(res=>{
    let data=res.body;
    this.titleService.setTitle(data.blocks.title||this.translate.instant('page_titles.payment_methods'))
    if(data.blocks){
      this.metaService.updateTag( { name: 'keywords', content: data.blocks.keywords || this.translate.instant('page_titles.payment_methods') })
      this.metaService.updateTag( { name: 'description', content: data.blocks.description || this.translate.instant('page_titles.payment_methods') })
  }
  });
}

}
