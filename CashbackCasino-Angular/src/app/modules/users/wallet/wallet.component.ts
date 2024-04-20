// import { Component, OnInit } from '@angular/core';
import { Component, OnInit, HostListener, Input } from '@angular/core';
import { FormGroup} from '@angular/forms';
import { HttpService, ModalService, AuthService, SharedService } from 'src/app/core/services';
import { APIS, DEFAULT_VALUES, USER_DETAILS } from 'src/app/common/constants';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import * as _ from 'lodash';
import { TranslateService } from '@ngx-translate/core';
import { AddBalanceWalletComponent } from '../bonuses/add-balance-wallet/add-balance-wallet.component';
import { HeaderService } from '../../../core/services/header.service';
import { RestrictionsService } from 'src/app/core/services/restrictions.service';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss']
})
export class WalletComponent implements OnInit {

  // constructor() { }
  goToDeposits;
  goToLimits;
  bonusHistory;
  bonuses;
  limitsAdvancedMode: boolean;
  coolOffAdvancedMode: boolean;
  limitForm: FormGroup;
  closeModal: Boolean = false;
  @Input() profileEdit: boolean = false;
  show30: boolean = false;
  show60: boolean = false;
  show90: boolean = false;
  title: string = this.translate.instant('links_text.balance');
  accounts_types: any = ['deposit', 'loss', 'wager'];
  accounts_periods: any = ['day', 'week', 'month'];
  bonusHistoryStages = ["lost", "canceled", "expired", "wager_done"];
  allCurrencies = [];
  transactionHistory = [];
  history = [];
  activeTab;
  limitSuccess: boolean = false;
  realityLimitSuccess: boolean = false;
  timeOutLimitSuccess: boolean = false;
  selfExclusionLimitSuccess: boolean = false;
  hide: any = {};
  currentRealityCheckTime: number;
  showSidebar: boolean;
  balance;
  selectedCurrency;
  empty = "0";
  depositFlag = false;
  withdrawFlag = false;
  playersDetailedAccountInfo;
  UserDetails = { ...USER_DETAILS };

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (window.innerWidth <= DEFAULT_VALUES.MOBILE_SIZE && this.showSidebar == undefined) {
      this.showSidebar = true;
    }
    else if (window.innerWidth > DEFAULT_VALUES.MOBILE_SIZE && this.showSidebar != undefined) {
      this.showSidebar = undefined;
    }
  }
  constructor(
    private httpService: HttpService,
    private activeModal: NgbActiveModal,
    private translate: TranslateService,
    private modalService: ModalService,
    private headerService: HeaderService,
    private authService: AuthService,
    private sharedService:SharedService,
    private restrictionService:RestrictionsService
  ) { }

  ngOnInit(): void {
    if (window.innerWidth <= DEFAULT_VALUES.MOBILE_SIZE) {
      this.showSidebar = true;
    }
    
    this.modalService.updateBalance.subscribe((res)=>{
      if(res) {
        this.httpService.getData(APIS.PLAYER.ACCOUNTS).subscribe(data => {
          this.balance = data.body;
          this.selectedCurrency = this.authService.getUserData(USER_DETAILS.Currency);
          this.detailedAccountInfo();
        })
      }
    })

    this.depositFlag = false;
    this.withdrawFlag = false;

    // First we get the viewport height and we multiple it by 1% to get a value for a vh unit
    let vh = window.innerHeight * 0.01;
    // Then we set the value in the --vh custom property to the root of the document
    document.documentElement.style.setProperty('--vh', `${vh}px`);

    this.initProfileForm();


    this.headerService.isUpdateAccount.subscribe(res => {
      if (res) {
        // console.log("http.service: ", this.httpService.getData(`${APIS.PLAYER.ACCOUNTS}?compatibility=false`))
        this.httpService.getData(APIS.PLAYER.ACCOUNTS).subscribe(data => {
          this.balance = data.body;
          this.selectedCurrency = this.authService.getUserData(USER_DETAILS.Currency);
          this.detailedAccountInfo();
        })
      }
    })

    // this.selectedCurrency = this.authService.getUserData(USER_DETAILS.Currency);

    // for (var i = 0; i < this.balance.length; i++) {
    //   if (this.selectedCurrency == this.balance[i].currency) {
    //     this.balance[i].selected = true;
    //   }
    //   else {
    //     this.balance[i].selected = false;
    //   }
    // }
  }

  detailedAccountInfo() {
    this.httpService.getData(`${APIS.PLAYER.ACCOUNTS}?compatibility=false`).subscribe(res => {
      this.playersDetailedAccountInfo = res.body
      if (this.playersDetailedAccountInfo) {
        for (var j = 0; j < this.balance?.length; j++) {
          for (var i = 0; i < this.playersDetailedAccountInfo.length; i++) {
            if (this.playersDetailedAccountInfo[i].currency == this.balance[j].currency) {
              this.playersDetailedAccountInfo[i].selected = this.balance[j].selected;
              this.playersDetailedAccountInfo[i].currencySymbol = this.balance[j].currencySymbol;
              // this.playersDetailedAccountInfo[i].amount_cents=this.balance[j].amount_cents;
              // this.playersDetailedAccountInfo[i].available_to_cashout_cents=this.balance[j].available_to_cashout_cents;
              this.balance.splice(j, 1, this.playersDetailedAccountInfo[i]);
            }
          }
        }
        this.selectedCurrency = this.authService.getUserData(USER_DETAILS.Currency);

        for (var i = 0; i < this.balance?.length; i++) {
          if (this.selectedCurrency == this.balance[i].currency) {
            this.balance[i].selected = true;
          }
          else {
            this.balance[i].selected = false;
          }
          for (var j = 0; j < this.allCurrencies.length; j++) {
            if (this.balance[i].currency == this.allCurrencies[j].code) {
              this.balance[i].currencySymbol = this.allCurrencies[j].symbol;
              break;
            }
          }
        }
        this.balance=this.restrictionService.restrictUserCurrencies(this.balance,this.restrictionService.currencies)

      }
    })
  }

  initProfileForm() {

    this.httpService.getData(APIS.PAYMENTS.HISTORY).subscribe((res) => {
      this.transactionHistory = res.body.reverse();
    })
    this.httpService.getData(APIS.PLAYER.BONUSES).subscribe((res) => {
      this.bonuses = res.body.reverse();
      this.filterBonusHistory(this.bonuses)
    });
    // this.httpService.getData(APIS.CURRENCIES).subscribe((res) => {
      // this.allCurrencies = res.body;
      this.sharedService.isCurrenciesUpdated.subscribe((res)=>{
        this.allCurrencies=this.sharedService.allCurrencies;
        for (var i = 0; i < this.balance?.length; i++) {
          for (var j = 0; j < this.allCurrencies.length; j++) {
            if (this.balance[i].currency == this.allCurrencies[j].code) {
              this.balance[i].currencySymbol = this.allCurrencies[j].symbol;
              break;
            }
          }
        }
    })


    // });
    this.httpService.getData(APIS.PLAYER.ACCOUNTS).subscribe(data => {
      this.balance = data.body;
      this.selectedCurrency = this.authService.getUserData(USER_DETAILS.Currency);
      this.detailedAccountInfo();
    })

    // this.detailedAccountInfo();
  }

  filterBonusHistory(bonuses) {
    this.bonuses = _.filter(bonuses, (bonus) => {
      return this.bonusHistoryStages.indexOf(bonus.stage) >= 0
    });
    this.activeTab = 'bonus';
    this.getHistory('30');
  }

  getHistory(days) {
    let date;
    if (days == '30') {
      this.show30 = true;
      this.show60 = this.show90 = false;
      date = moment().subtract(30, 'days');
    }
    else if (days == '60') {
      this.show60 = true;
      this.show30 = this.show90 = false;
      date = moment().subtract(60, 'days');
    }
    else if (days == '90') {
      this.show90 = true;
      this.show30 = this.show60 = false;
      date = moment().subtract(90, 'days');
    }
    if (this.activeTab == "history") {
      this.history = this.transactionHistory.filter((res) => {
        let givenDate = moment(new Date(res.created_at));
        return givenDate.isAfter(date);
      });
    }
  }

  changeTab($event, customTitle?) {

    // console.log("$event.target.hash: ", $event.target.hash)
    var playerAccounts
    switch ($event.target.hash) {
      case '#nav-balance': {
        this.activeTab = 'balance';

        this.depositFlag = false;
        this.withdrawFlag = false;

        this.httpService.getData(APIS.PLAYER.ACCOUNTS).subscribe((res) => {
          if (res) {
            playerAccounts = res.body;
            this.balance = playerAccounts;

            // for (var i = 0; i < this.balance.length; i++) {
            //   if (this.selectedCurrency == this.balance[i].currency) {
            //     this.balance[i].selected = true;
            //   }
            //   else {
            //     this.balance[i].selected = false;
            //   }
            // }

            this.detailedAccountInfo();
          }
        });

        break;
      }
      case '#nav-deposit': {
        // this.selectedCurrency = this.authService.getUserData("currency");
        this.depositFlag = true;
        this.withdrawFlag = false;
        this.activeTab = 'deposit'; break;
      }
      case '#nav-withdrawl': {
        // this.selectedCurrency = this.authService.getUserData("currency");
        // console.log("this.withdrawFlag: ", this.withdrawFlag)

        this.depositFlag = false;
        this.withdrawFlag = true;
        // console.log("this.withdrawFlag: ", this.withdrawFlag)
        this.activeTab = 'withdrawal'; break;
      }
      case '#nav-history': {
        this.depositFlag = false;
        this.withdrawFlag = false;
        this.httpService.getData(APIS.PAYMENTS.HISTORY).subscribe((res) => {
          this.transactionHistory = res.body.reverse();
        })
        this.activeTab = 'history'; break;
      }

    }
    this.limitSuccess = false;
    this.title = customTitle ? customTitle : $event.target.text;
    if (typeof this.showSidebar === "boolean") {
      this.showSidebar = false;
    }
    this.getHistory('30');
  }

  changeTabToDeposit() {
    this.goToDeposits = true;
    this.activeTab = 'deposit';
    this.title = 'deposit'
    this.depositFlag = true;
    this.withdrawFlag = false;
  }

  makeDefault(account, index) {

    this.balance[index].selected = true;
    this.selectedCurrency = this.balance[index].currency;

    for (var i = 0; i < this.balance?.length; i++) {
      if (i != index) {
        this.balance[i].selected = false;
      }
    }
    this.headerService.headerBalanceUpdate(this.balance);
    this.httpService.postData(APIS.UPDATE_CURRENCY,{currency:this.balance[index].currency}).subscribe((res:any)=>{
      if(res) {
      this.authService.setUserData(this.UserDetails.Currency, res?.currency);
      }
    })
    // console.log("this.balance: ", this.balance)
  }
  

  close(value?) {
    if (!this.profileEdit || this.limitSuccess) {
      this.activeModal.close();
    }
    else {
      this.closeModal = !this.closeModal;
    }
  }

  getStatus(status, finishedAt) {
    if(!status && finishedAt) {
      return this.translate.instant('text.discarded');
    }
    else if(!status && !finishedAt) {
      return this.translate.instant('text.pending')
    }
    else {
      return this.translate.instant('text.completed')
    }
  }

  getTranslatedPayment(text) {
    if(text=='deposit') {
      return this.translate.instant('title.deposit');
    } else if(text=='withdraw') {
      return this.translate.instant('title.withdrawal');
    }
    else {
      return text;
    }
  }

  addNewCurrency() {
    // var existingAccounts = [];
    // existingAccounts.push(this.balance);
    // console.log("existing acc: ", existingAccounts)
    this.modalService.openModal(AddBalanceWalletComponent, { "allCurrencies": this.allCurrencies, "existingAccounts": this.balance })
    
    //curr[i].code
  }

}
