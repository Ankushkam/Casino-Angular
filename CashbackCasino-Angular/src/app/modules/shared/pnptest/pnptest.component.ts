import { Component, HostListener, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { DEFAULT_VALUES, GAMES_LIST, MODALS, USER_DETAILS } from 'src/app/common/constants';
import { ICollection, IGameProvider } from 'src/app/core/interfaces/games';
import { AuthService, SharedService } from 'src/app/core/services';
import { HomeService } from 'src/app/core/services/home.service';
import { DepositsComponent } from '../../users/payments/deposits/deposits.component';
import { PayNPlayModalComponent } from '../pay-n-play-modal/pay-n-play-modal.component';

@Component({
  selector: 'app-pnptest',
  templateUrl: './pnptest.component.html',
  styleUrls: ['./pnptest.component.scss']
})
export class PNPtestComponent implements OnInit {

  providers: IGameProvider[];
  allGames: any;
  promoImg;
  gameCollection: ICollection[];
  slideConfig = { "slidesToShow": 2, "slidesToScroll": 1 };
  isLoginUser: boolean;
  subscriptions: Array<Subscription> = [];
  welcomeContent: string = "";
  GAME_LIST = { ...GAMES_LIST };
  content;
  currentRoute;
  isPNPAllowed=true;
  hidePnpBox;
  currentIp;
  // depositButton=this.translate.instant('links_text.deposit');
  mobile: boolean = false;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.mobile = (window.innerWidth <= DEFAULT_VALUES.MOBILE_SIZE_SMALL) ? true : false;
  }

  constructor(
    private authService: AuthService,
    public homeService: HomeService,
    private sharedService: SharedService,
    private titleService:Title,
    private ngModal: NgbModal,
    private router:Router,
    private activatedRoute:ActivatedRoute,
    private translate:TranslateService
  ) { 
  }

  ngOnInit(): void {
    this.currentRoute = this.router.url;
    this.activatedRoute.data.subscribe(res => {
      this.promoImg = res.promoImg;
    });
    this.mobile = (window.innerWidth <= DEFAULT_VALUES.MOBILE_SIZE_SMALL) ? true : false;
    this.getData();
    this.initSubscriptions();
  }


  initSubscriptions() {
    this.currentIp=this.sharedService.currentIP.value;

    this.titleService.setTitle("Cashback casino");
    this.sharedService.isHidePNP.subscribe((res)=>{
      this.hidePnpBox=res;
    })

    this.authService.authentication.subscribe((res: boolean) => {
      this.isLoginUser = !!res;
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
    }
  }

  

  getData() {
    this.sharedService.snippets.subscribe(res=>{
      if(res) {
      let data=JSON.parse(res.find(snippet => snippet.id == "home-banner")?.content);
      // this.content=data;
      this.content=data[localStorage.getItem(USER_DETAILS.Locale) || this.translate.currentLang];
      if(this.isPNPAllowed){
        if(this.currentIp?.country_code=='SE' && this.translate.currentLang=='en'){
          this.content=data['en-en'];
        }
      this.content=data['pnp'];
      }
    }
    });
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

  ngOnDestroy() {
    this.subscriptions.forEach(sub =>{
        sub.unsubscribe();
    });
  }

}
