import { SupportService } from './../../../core/services/support.service';
import { HttpService } from './../../../core/services/http.service';
import { Component, Injector, OnInit, ViewEncapsulation } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DepositsComponent } from '../../users/payments/deposits/deposits.component';
import * as _ from 'lodash';
import * as $ from 'jquery';
import { SIDEBAR_ITEMS } from './../../../common/config';
import { ISidebarItem } from './../../../core/interfaces/sidebar-item';
import { AuthService, ModalService, RealTimeService, SharedService } from 'src/app/core/services';
import { HeaderService } from './../../../core/services/header.service';
import { MyProfileComponent } from '../../users/my-profile/my-profile.component';
import { APIS, USER_DETAILS, FLAGS, MODALS } from 'src/app/common/constants';
import { BonusesModalComponent } from '../../users/bonuses/bonuses-modal/bonuses-modal.component';
import { HomeService } from 'src/app/core/services/home.service';
import { CurrentLevel } from 'src/app/core/interfaces';
import { Subscription } from 'rxjs';
import { RegisterComponent } from '../../auth/register/register.component';
import { LoginComponent } from '../../auth/login/login.component';
import { TranslateService } from '@ngx-translate/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PayNPlayModalComponent } from '../../shared/pay-n-play-modal/pay-n-play-modal.component';
import { GamePlayService } from 'src/app/core/services/game-play.service';
import { DocumentService } from 'src/app/core/services/user.service';
import { SignupComponent } from '../../auth/signup/signup.component';


@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SidebarComponent implements OnInit {
  sidebarCss: any;
  isLoginUser: boolean;
  items: ISidebarItem[];
  selectedFlag;
  currency;
  now:number
  allCurrencies = [];
  playerAccounts = [];
  accountBalance;
  winners: any;
  empty = "0";
  isPNPAllowed:boolean;
  userName: string;
  currentLevel: CurrentLevel;
  subscription1: Subscription;
  flagItems;
  isRecieveBonuses;
  sessionDate;
  currentLang:string = this.translate.currentLang;
  // login_button;
  // depositButton;
  constructor(
    private translate:TranslateService,
    private headerService: HeaderService,
    private authService: AuthService,
    private realTimeService: RealTimeService,
    private ngModal: NgbModal,
    private httpService: HttpService,
    private modalService: ModalService,
    private supportService: SupportService,
    private sharedService: SharedService,
    public homeService: HomeService,
    private router:Router,
    private gameService:GamePlayService,
    private injector:Injector,
    private route:ActivatedRoute
  ) {
    this.sidebarCss = {
      left_sidebar: true,
      'open-sidebar': false,
      'side_login':false
    }
    setInterval(() => {
      this.now = Date.now();
    }, 1);
  }

  ngOnInit(): void {
    this.getSelectedLocale();
    this.subscription1 = this.sharedService.currentLevel$.subscribe(res=>{
      this.currentLevel = res;
    });
    this.sharedService.isHideTabs.subscribe((res)=>{
        if(res?.length>0){
          let items = _.cloneDeep(SIDEBAR_ITEMS);
        //   _.remove(items, function(currentObject) {
        //     return currentObject.name == 'loyalty_program' || currentObject.name == 'promotions';
        // });
        this.items=items.filter(item => !res.includes(item.name));
        } else {
        this.items = _.cloneDeep(SIDEBAR_ITEMS);
        }
    })
    this.headerService.toggle.subscribe(res => {
      this.sidebarCss['open-sidebar'] = res;
    })
    this.authService.authentication.subscribe((res) => {
      /** load snippets data  */
      // this.sharedService.setSnippetsData();
      this.isLoginUser = !!res;
      this.sidebarCss['side_login'] = res;
      if (this.isLoginUser) {
        this.userName = `${this.authService.getUserData(USER_DETAILS.FirstName)} ${this.authService.getUserData(USER_DETAILS.LastName) || ''}`
      }
      else{
        this.route.queryParams.subscribe(res=>{
          if(res.register){
            this.onSignUp('');
          }
        })
        this.sharedService.checkLevelUpdate({});
      }
      this.currency = this.authService.getUserData(USER_DETAILS.Currency);
      this.getPlayerAccounts();
      this.currentLang = this.translate.currentLang;
      this.translate.onLangChange.subscribe((res)=>{
        this.currentLang=res.lang;
      })
    });
    this.sharedService.isCurrenciesUpdated.subscribe((res)=>{
      this.allCurrencies=this.sharedService.allCurrencies;
  })
    // this.items = _.cloneDeep(SIDEBAR_ITEMS);
    this.sharedService.session.subscribe((res)=>{
      if(res) {
      this.sessionDate=new Date(res.created_at);
      }
    });
    // this.subscribeRealTimeData();
    this.sharedService.pnpAlowed.subscribe(res=>{
      this.isPNPAllowed=res;
    });
  }

  getSelectedLocale() {
    const userService=this.injector.get(DocumentService)
    let index=FLAGS.findIndex((flag)=>{
      return flag.link==this.translate.currentLang;
    })
    this.flagItems=[...FLAGS]
    if(index>-1) {
    //   if(this.authService.isAuthenticated()){
    //   userService.getPlayerData().subscribe((res)=>{
    //     console.log(res);
    //     console.log(userService.playerdata)
    //     this.authService.updateUserDetails(userService.playerdata)
    //   })
    // }
      this.authService.setUserData(USER_DETAILS.Locale,this.translate.currentLang)
      this.selectedFlag=FLAGS[index];
      this.flagItems.splice(index,1);
    } else {
      let enIndex=FLAGS.findIndex((flag)=>{
        return flag.link=='en';
      });
      this.selectedFlag=FLAGS[enIndex];
      this.flagItems.splice(enIndex,1);;
    }
  }

  changelocale(lang){
    return new Promise((resolve)=>{
      this.translate.use(lang).subscribe( suc => {
        resolve();
      }); 
    })
  }

  switchLang(flag) {
    let lang=flag.link;
    this.changelocale(lang).then(res=>{
      this.getSelectedLocale();
      this.headerService.updateHeader();
      this.selectedFlag=flag;
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

  getPlayerAccounts() {
    this.httpService.getData(APIS.PLAYER.ACCOUNTS).subscribe((res) => {
      this.playerAccounts = res.body;
      this.accountBalance = this.playerAccounts.find((account) => {
        return account.currency == this.currency;
      })
    });
    if (!this.accountBalance) {
      this.accountBalance = "0";
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
    this.toggle();
  }

  openBonuses() {
    this.toggle();
    this.modalService.openModal(BonusesModalComponent);
  }

  toggle() {
    $('body').scrollTop(0);
    this.headerService.toggleSideBar();
  }
  login() {
    if((this.isPNPAllowed|| this.router.url=='/payandplaytest') && !this.isLoginUser) {
      let modalRef=this.ngModal.open(PayNPlayModalComponent, {
        size: 'md',
        keyboard: false,
        windowClass: 'pnp-modal',
        centered: true
      });
      modalRef.componentInstance.type=MODALS.LOGIN;
    } else {
    this.modalService.openModal(LoginComponent);
    this.toggle();
    }
  }
  onSignUp(value) {
    if((this.isPNPAllowed || this.router.url=='/payandplaytest') && !this.isLoginUser) {
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
    this.toggle();
  }
  logout() {
    this.authService.logout()
  }
  myProfile() {
    this.modalService.openModal(MyProfileComponent);
    this.toggle();
  }
  subscribeRealTimeData() {
    this.realTimeService.subscribe('public:wins', function (resp) {
      var gameData = resp.data;
      if (gameData.round.bet < gameData.round.win) {
        gameData.nickname = gameData.player.nickname;
        gameData.win_amount_cents = gameData.round.win;
        gameData.currency = gameData.round.currency;
        gameData.humanized_win = gameData.round.win;
        this.winners?.unshift(gameData);
      }
    });
  }
  openChatWindoe() {
    this.toggle();
    this.supportService.show();
  }
  ngOnDestroy() {
    this.subscription1.unsubscribe();
  }
}
