import { Component, OnInit, Inject, Input, Injector } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { AuthService, SharedService, ModalService } from 'src/app/core/services';
import { HeaderService } from './../../../core/services/header.service';
import { MyProfileComponent } from '../../users/my-profile/my-profile.component';
import { WalletComponent } from '../../users/wallet/wallet.component';
import { DepositsComponent } from '../../users/payments/deposits/deposits.component';
import { USER_DETAILS, FLAGS, MODALS } from 'src/app/common/constants';
import { CurrentLevel } from 'src/app/core/interfaces';
import { Subscription } from 'rxjs';
import { LoginComponent } from '../../auth/login/login.component';
import { BonusesModalComponent } from '../../users/bonuses/bonuses-modal/bonuses-modal.component';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { PayNPlayModalComponent } from '../../shared/pay-n-play-modal/pay-n-play-modal.component';
import { getScrollHeight } from 'src/app/common/utils';
import { RegisterComponent } from '../../auth/register/register.component';
import { GamePlayService } from 'src/app/core/services/game-play.service';
import { GamesService } from 'src/app/components/home/games/games.service';
import { DocumentService } from 'src/app/core/services/user.service';
import { SignupComponent } from '../../auth/signup/signup.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Input() showProgressBar: boolean = false;
  @Input() displayPNP;
  @Input() hideTabs;

  isSelectFlag = false;
  isSelectNotification = false;
  isSelectCurrency = false;
  isSelectProfile = false;
  isShowHeader = true;
  isLoginUser: boolean;
  login_button;
  signup_button;
  depositButton;
  selectedFlag;
  empty = "0";
  playerAccounts = [];
  allCurrencies = [];
  accountBalance;
  currency;
  userName: string;
  isPNPAllowed: boolean;
  showSearchInput:boolean;

  profileItems = [
    { link: '#', value: 'My Profile' },
    { link: '#', value: 'Logout' },
  ]
  currencyItems = [
    // { link: '#', value: '250 EUR' },
    // { link: '#', value: '200 EUR' },
    // { link: '#', value: '150 EUR' },
  ]
  flagItems = FLAGS;
  currentLevel: CurrentLevel;
  subscription1: Subscription;
  subscription2:Subscription
  allGames;
  allKeys
  nextLevel;
  hideBonuses;
  hideCashbackBonuses;
  getScrollHeight = getScrollHeight;
  constructor(
    @Inject(DOCUMENT) private document: Document,
    private headerService: HeaderService,
    private authService: AuthService,
    private modalService: ModalService,
    private ngModal: NgbModal,
    private sharedService: SharedService,
    private router: Router,
    private translate: TranslateService,
    private gameService: GamePlayService,
    private gamesService:GamesService,
    private injector:Injector,
    private route:ActivatedRoute
  ) {
    this.login_button = translate.instant('links_text.login');
    this.signup_button = translate.instant('links_text.sign_up');
    this.depositButton = translate.instant('links_text.deposit');
    window.addEventListener('scroll', this.getScrollHeight, true);
  }

  ngOnInit(): void {

    this.getSelectedLocale();
    this.gamesService.updateList.subscribe(res => {
      if (res) {
        this.allGames = this.gamesService.allGames;
        this.allKeys = Object.keys(this.allGames);
      }else if (!res && this.gamesService.allGames) {
        this.gamesService.updateGamesList();
      }
    })
    this.sharedService.isHideTabs.subscribe((res)=>{
      if(res?.length>0){
        this.hideTabs=res.find((ele)=>{return ele=='loyalty_program'});
      }
      else {
        this.hideTabs=false;
      }
    })
    this.sharedService.isHideBonuses.subscribe((res)=>{
      this.hideBonuses=res;
    })
    this.sharedService.isHideCashbackBonus.subscribe((res)=>{
      this.hideCashbackBonuses=res;
    })
    this.subscription1 = this.sharedService.currentLevel$.subscribe(res => {
      this.currentLevel = res;
    })
    this.subscription2 = this.sharedService.previousLevel$.subscribe(res => {
      this.nextLevel = res;
    })
    this.authService.authentication.subscribe((res) => {
      this.isLoginUser = !!res;
      if (this.isLoginUser) {
        this.userName = `${this.authService.getUserData(USER_DETAILS.FirstName) || ''} ${this.authService.getUserData(USER_DETAILS.LastName) || ''}`;
        this.headerService.headerData.subscribe((res) => {

          if (res) {
            if (res.currencies) {
              this.allCurrencies = res.currencies;
            }
            this.getPlayerAccounts(res.playerAccounts);
          } else {
            this.headerService.fetchData();
          }
          this.route.queryParams.subscribe(res=>{
            if(res.withdrawal){
              this.myWallet();
            }
          })
        });

      }
      this.currency = this.authService.getUserData(USER_DETAILS.Currency);
    });
    // this.httpService.getData(APIS.CURRENCIES).subscribe(res => {
    //   this.allCurrencies = res.body;
    // });
    this.sharedService.isCurrenciesUpdated.subscribe((res)=>{
      this.allCurrencies=this.sharedService.allCurrencies;
  })
    this.getPNPStatus();
    this.headerService.isUpdateHeader.subscribe(res => {
      if (res) {
        this.getPNPStatus();
      }
    })
  }

  locale;
  getPNPStatus() {

    var arrOfURL = document.URL.split("//");
    var newURL = arrOfURL[1].split("/");

    this.locale = newURL[1];
    this.sharedService.pnpAlowed.subscribe(res => {
      this.isPNPAllowed = res;
      if(this.displayPNP){
        this.isPNPAllowed=true;
      }
      if (res && this.translate.currentLang == 'fi') {
        this.login_button = this.translate.instant('links_text.login_pnp');
        this.signup_button = this.translate.instant('links_text.sign_up_pnp');
        this.depositButton = this.translate.instant('text.deposit_and_play');
      } else if (this.translate.currentLang == 'fi') {
        this.depositButton = this.translate.instant('text.deposit_and_play');
      } else if (this.translate.currentLang == 'de') {
        this.depositButton = this.translate.instant('text.deposit_and_play');
      } else if (this.locale == 'en' && this.isPNPAllowed) {
        this.login_button = this.translate.instant('links_text.login');
        this.signup_button = this.translate.instant('links_text.sign_up');
        this.depositButton = this.translate.instant('text.deposit_and_play');
      }
      else {
        this.login_button = this.translate.instant('links_text.login');
        this.signup_button = this.translate.instant('links_text.sign_up');
        this.depositButton = this.translate.instant('links_text.deposit');
      }
    });
  }

  getSelectedLocale() {
    const userService=this.injector.get(DocumentService)
    let index = FLAGS.findIndex((flag) => {
      return flag.link == this.translate.currentLang;
    })
    this.flagItems = [...FLAGS]
    if (index > -1) {
    //   if(this.authService.isAuthenticated()){
    //   userService.getPlayerData().subscribe((res)=>{
    //     console.log(res);
    //     console.log(userService.playerdata)
    //     this.authService.updateUserDetails(userService.playerdata)
    //   })
    // }
      this.authService.setUserData(USER_DETAILS.Locale,this.translate.currentLang)
      this.selectedFlag = FLAGS[index];
      this.flagItems.splice(index, 1);
    } else {
      let enIndex = FLAGS.findIndex((flag) => {
        return flag.link == 'en';
      });
      this.selectedFlag = FLAGS[enIndex];
      this.flagItems.splice(enIndex, 1);;
    }
  }

  changelocale(lang) {
    return new Promise((resolve) => {
      this.translate.use(lang).subscribe(suc => {
        resolve();
      });
    })
  }

  switchLang(flag) {
    let lang = flag.link;
    this.changelocale(lang).then(res => {
      this.getSelectedLocale();
      this.headerService.updateHeader();
      this.selectedFlag = flag;
      this.gameService.getGamesData();
      this.sharedService.setSnippetsData();
      this.sharedService.getCurrentIP();

      // this.router.navigate(['./', {lang: lang}], {relativeTo: this.route});
      let currentUrl: string = this.router.url;
      let parts: Array<string> = /\/(.+)\/(.+)/.exec(currentUrl);
      if (parts) {
        let currentLanguage = parts[1];
        let currentPage = parts[2];
        if (currentLanguage != lang) {
          let newUrl = `/${lang}/${currentPage}`;
          this.router.navigateByUrl(newUrl);
          // window.location.href = newUrl;
        }
      } else {
        // window.location.href = `/${lang}`;
        this.router.navigate(['./']);
      }
    });


  }

  playSearchGame(key) {
    this.showSearchInput=false;
    this.router.navigate(['/play-games', key])
    this.gamesService.clickSearchedGame(key);
    return
  }



  // @HostListener('window:scroll', [])
  // onWindowScroll() {
  //   if (document.body.scrollTop > 40 ||
  //     document.documentElement.scrollTop > 40) {
  //     document.getElementById('header').classList.add('header-sticky');
  //   } else {
  //     document.getElementById('header').classList.remove('header-sticky');
  //   }
  //   console.log(document.getElementById('header'))
  // }

  toggle() {
    this.headerService.toggleSideBar();
  }

  openBonuses() {
    this.modalService.openModal(BonusesModalComponent);
  }

  getPlayerAccounts(accounts) {
    this.playerAccounts = accounts;
    this.currency = this.authService.getUserData(USER_DETAILS.Currency);

    this.accountBalance = this.playerAccounts.find((account) => {

      return account.currency == this.currency;
    })
    if (!this.accountBalance) {
      this.accountBalance = "0";
    }
  }

  resetDropdown() {
    this.isSelectFlag = false;
    this.isSelectNotification = false;
    this.isSelectCurrency = false;
    this.isSelectProfile = false;
  }

  onFlagSelect(prevValue) {
    this.resetDropdown();
    this.isSelectFlag = !prevValue;
  }
  onSelectNotification(prevValue) {
    this.resetDropdown();
    this.isSelectNotification = !prevValue;
  }
  onSelectCurrency(prevValue) {
    this.resetDropdown();
    this.isSelectCurrency = !prevValue;
  }
  onSelectProfile(prevValue) {
    this.resetDropdown();
    this.isSelectProfile = !prevValue;
  }

  login() {
    if (this.isPNPAllowed) {
      let modalRef = this.ngModal.open(PayNPlayModalComponent, {
        size: 'md',
        keyboard: false,
        windowClass: 'pnp-modal',
        centered: true
      });
      modalRef.componentInstance.type = MODALS.LOGIN;
    } else {
      this.modalService.openModal(LoginComponent);
    }
  }

  openSignUp() {
    if (this.isPNPAllowed) {
      let modalRef = this.ngModal.open(PayNPlayModalComponent, {
        size: 'md',
        keyboard: false,
        windowClass: 'pnp-modal',
        centered: true
      });
      modalRef.componentInstance.type = MODALS.SIGNUP;
    } else {
      this.modalService.openModal(SignupComponent);
    }

  }

  openDeposits() {
    if (this.isPNPAllowed) {
      let modalRef = this.ngModal.open(PayNPlayModalComponent, {
        size: 'md',
        keyboard: false,
        windowClass: 'pnp-modal',
        centered: true
      });
      modalRef.componentInstance.type = MODALS.DEPOSIT;
    } else {
    this.ngModal.open(DepositsComponent, {
      size: 'lg',
      keyboard: false,
      windowClass: 'modal-active'
    });
  }
  }

  logout() {
    this.authService.logout();
  }
  myProfile() {
    this.ngModal.open(MyProfileComponent, {
      size: 'lg',
      centered: true,
      backdrop: 'static',
      keyboard: false
    });
  }
  myWallet() {
   this.modalService.openModal(WalletComponent, { "selectedCurrency": this.currency });
    // this.modalService.openModal(WalletComponent, { "balance": this.playerAccounts, "selectedCurrency": this.currency });
  }

  ngOnDestroy() {
    this.subscription1.unsubscribe();
  }
}