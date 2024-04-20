import { GamesService } from './games/games.service';
import { IWinner, WINNER_TYPE } from './../../core/interfaces/winner';
import { APIS, DEFAULT_VALUES, GAMES_LIST, MODALS, ROUTING } from './../../common/constants';
import { IGameProvider, ICollection } from './../../core/interfaces/games';
import { AuthService, RealTimeService, SharedService, ModalService, HttpService } from 'src/app/core/services';
import { Component, HostListener, OnInit, ViewEncapsulation } from '@angular/core';
import { HomeService } from 'src/app/core/services/home.service';
import { Subscription } from 'rxjs';
import { RegisterComponent } from 'src/app/modules/auth/register/register.component';
import { Meta, Title } from '@angular/platform-browser';
import { PayNPlayResolver } from 'src/app/core/services/pay-n-play.resolver';
import { DepositsComponent } from 'src/app/modules/users/payments/deposits/deposits.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PayNPlayModalComponent } from 'src/app/modules/shared/pay-n-play-modal/pay-n-play-modal.component';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SignupComponent } from 'src/app/modules/auth/signup/signup.component';
import { HeaderService } from '../../core/services/header.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  encapsulation:ViewEncapsulation.None
})
export class HomeComponent implements OnInit {
  slides = [
    { img: "assets/img/games/legend_big.jpg", btnText: 'WELCOME OFFER' },
    { img: "assets/img/games/vicky_big.jpg", btnText: 'Get Free Spins' },
    { img: "assets/img/games/legend_big.jpg", btnText: 'WELCOME OFFER' },
  ];
  winners: IWinner[];
  winnerType: WINNER_TYPE;
  providers: IGameProvider[];
  allGames: any;
  promoImg;
  gameCollection: ICollection[];
  slideConfig = { "slidesToShow": 3, "slidesToScroll": 1 };
  isLoginUser: boolean;
  subscriptions: Array<Subscription> = [];
  welcomeContent: string = "";
  GAME_LIST = { ...GAMES_LIST };
  content;
  faqCardsData;
  currentRoute;
  isPNPAllowed=false;
  hideBonuses;
  hideCashbackBonuses;
  promoPageData;
  currentIP;
  pagePath=APIS.CMS.PAGES + '/home'
  mobile: boolean = false;
  hidePnpBox=false;
  currentLang: string;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.mobile = (window.innerWidth <= DEFAULT_VALUES.MOBILE_SIZE_SMALL) ? true : false;
  }

  constructor(
    private authService: AuthService,
    private realTimeService: RealTimeService,
    private gameService: GamesService,
    private modalService:ModalService,
    public homeService: HomeService,
    private sharedService: SharedService,
    private titleService:Title,
    private pnpService:PayNPlayResolver,
    private ngModal: NgbModal,
    private router:Router,
    private activatedRoute:ActivatedRoute,
    private httpService:HttpService,
    private metaService:Meta,
    private translate:TranslateService,
    private headerService:HeaderService
  ) { 
  }

  ngOnInit(): void {
    this.currentRoute = this.router.url;
    this.activatedRoute.data.subscribe(res => {
      this.promoImg = res.promoImg;
      this.promoPageData=res;

      if(res.hideBonuses){
      this.hideBonuses=res?.hideBonuses;
      this.hideCashbackBonuses=res?.hideBonuses;
      this.sharedService.hideBonuses(res?.hideBonuses);
      }
      if(res?.hideTabs?.length>0){
      this.sharedService.hideTabs(res?.hideTabs);
      }
    });
    this.currentLang = this.translate.currentLang;
    // console.log("current Language",this.currentLang)
    this.mobile = (window.innerWidth <= DEFAULT_VALUES.MOBILE_SIZE_SMALL) ? true : false;
    // this.getData();
    this.getPageData();
    this.initSubscriptions();
    this.homeService.getLatestWinners();
    this.subscribeRealTimeData();
  }


  initSubscriptions() {
    this.headerService.isUpdateHeader.subscribe(res=>{
      if(res){
        this.currentLang=this.translate.currentLang;
        // console.log("current Language",this.currentLang)
      }
    })
    this.sharedService.currentIP.subscribe((res)=>{
      if(res) {
        this.isPNPAllowed=this.pnpService.isCountryAllowed(res.country_code)?true:false;
        this.currentIP=res?.country_code
        // if(this.isPNPAllowed && this.translate.currentLang=='fi'){
        //   this.depositButton=this.translate.instant('text.deposit_and_play');
        this.getData()
        // }
      } else {
        this.sharedService.getCurrentIP();
      }
    })
    this.sharedService.isHideBonuses.subscribe((res)=>{
      this.hideBonuses=res;
    });
    this.sharedService.isHideCashbackBonus.subscribe((res)=>{
      this.hideCashbackBonuses=res;
    })

    this.sharedService.isHidePNP.subscribe((res)=>{
      this.hidePnpBox=res;
    })

    this.authService.authentication.subscribe((res: boolean) => {
      this.isLoginUser = !!res;
    });

    this.gameService.updateList.subscribe(res => {
      if (res  && this.sharedService.currentIP.value.country_code !== 'US') {
        this.providers = this.gameService.providers;
        this.allGames = this.gameService.allGames;
      }
    });

    this.subscriptions[0] = this.sharedService.snippets.subscribe(res => {
      this.welcomeContent = res.find(snippet => snippet.id == "home-welcome")?.content || "";
      this.faqCardsData = JSON.parse(res.find(snippet => snippet.id == "faq-cards-data")?.content) || {};
    });
  }

  onSignUp(value?) {
    if(this.isPNPAllowed) {
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

  getPageData(){
    this.httpService.getData(this.pagePath).subscribe((resp) =>{
        let data = resp.body;
        if(data.blocks){
            this.titleService.setTitle(data.blocks.title || "Cashback casino");
            this.metaService.updateTag( { name: 'keywords', content: data.blocks.keywords || "" })
            this.metaService.updateTag( { name: 'description', content: data.blocks.description || "" })
        }
    },()=>{
      this.titleService.setTitle("Cashback casino");
    });
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

  getData() {
    this.sharedService.snippets.subscribe(res=>{
      let data={}
      if(res) {
        let bannerObj=res?.find(snippet => snippet.id == "home-banner")?.content
        if(bannerObj){
        data=JSON.parse(bannerObj);
        }
      if(data){
      this.content=data[this.translate.currentLang];
      if(this.isPNPAllowed && this.currentIP=='FI'){
        this.content=data['pnp'];
        }
        if(this.isPNPAllowed && this.currentIP=='SE' && this.translate.currentLang=='en'){
          this.content=data['en-en'];
          }
      // if(this.promoImg || this.promoImg=='') {
      //   this.content['img']=this.promoImg
      // }
        }
    }
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub =>{
        sub.unsubscribe();
    });
  }
}
