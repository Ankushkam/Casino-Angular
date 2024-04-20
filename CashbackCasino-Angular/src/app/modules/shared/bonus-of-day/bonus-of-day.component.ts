import { Component, OnInit, HostListener, ViewChild, Input, OnDestroy } from '@angular/core';
import { DEFAULT_VALUES, APIS, PROMOTION_BONUSES_TYPE, WEEKDAYS, MODALS, ROUTING, BONUS_PROMOS } from 'src/app/common/constants';
import { SlickCarouselComponent } from 'ngx-slick-carousel';
import { SharedService, AuthService, ModalService, HttpService } from 'src/app/core/services';
import { DepositsComponent } from 'src/app/modules/users/payments/deposits/deposits.component';
import { LoginComponent } from 'src/app/modules/auth/login/login.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { PayNPlayModalComponent } from '../pay-n-play-modal/pay-n-play-modal.component';
import { trigger } from '@angular/animations';
import { Router } from '@angular/router';

@Component({
  selector: 'app-bonus-of-day',
  templateUrl: './bonus-of-day.component.html',
  styleUrls: ["./bonus-of-day.component.scss","../../../components/promotions/promotions.component.scss"]
})
export class BonusOfDayComponent implements OnInit ,OnDestroy{
  @Input() page;
  title;
  // slides = [
  //   { img: "assets/img/games/legend_big.jpg", btnText: 'WELCOME OFFER' },
  //   { img: "assets/img/games/vicky_big.jpg", btnText: 'Get Free Spins' },
  //   { img: "assets/img/games/legend_big.jpg", btnText: 'WELCOME OFFER' },
  // ];
  slides:any=[];
  highRoller=[];
  standard=[];
  filteredSlides=[];
  bonusTypes=PROMOTION_BONUSES_TYPE;
  depositsCount;
  slideConfig = { "slidesToShow": 3, "slidesToScroll": 2 };
  activeBonusType=PROMOTION_BONUSES_TYPE.STANDARD;
  displayBonusType;
  isPNPAllowed: boolean;
  @ViewChild('slickModal') slickModal: SlickCarouselComponent;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if(this.page=='Bonus of Day'){
    this.slideConfig.slidesToShow = (window.innerWidth <= DEFAULT_VALUES.MOBILE_SIZE) ? 1 : 3;
    this.slickModal.unslick();
    this.slickModal.initSlick();
    // this.slickModal.slickGoTo(0);
    }
  }
  constructor(private sharedService:SharedService,private router:Router,private translate:TranslateService,private httpService:HttpService,private ngModal:NgbModal,private authService:AuthService, private modalService:ModalService) {}

  getData() {

    this.sharedService.pnpAlowed.subscribe(res=>{
      this.isPNPAllowed=res;
    });
    this.sharedService.isSnippetsUpdated.subscribe((res)=>{
      if(res){
      this.getSnippetData()
      }
      // console.log(this.sharedService.snippets.value)
    })
  }

  getAPIData() {
    this.httpService.getData(APIS.PLAYER.STATS).subscribe((res)=>{
      if(res.body){
      this.depositsCount=res?.body?.deposits_count || 0;
      }
      this.filterOffers(this.slides);
    })
  }

  getSnippetData() {
   
    // this.sharedService.snippets.subscribe(res=>{
      let res=this.sharedService.snippets.value;
      let currentIP=this.sharedService.currentIP.value;

      if(res.length>0) {
      let data=JSON.parse(res.find(snippet => snippet.id == "bonus-of-day")?.content)
      if(currentIP?.country_code=='FI'){
        data.offers=data?.offers?.filter((offer)=>{
          return offer.deposit=='Cashback'
        })
      }
      // if(this.slides.length==0) {
      this.slideConfig.slidesToShow = (window.innerWidth <= DEFAULT_VALUES.MOBILE_SIZE) ? 1 : 3;
      this.slickModal?.unslick();
      this.slides=data.offers || [];
      this.slides=this.slides.filter((offer)=>{
        if(this.router.url.includes(BONUS_PROMOS.PROMO_150)){
        return !offer.key || offer.key==BONUS_PROMOS.PROMO_150
        } else if(this.router.url.includes(BONUS_PROMOS.PROMO)){
          return !offer.key || offer.key==BONUS_PROMOS.PROMO
        } else {
          return !offer.key || offer.key==BONUS_PROMOS.NORMAL
        }
      })
      this.slides=this.slides.map(offer => {
        return offer.highroller && offer.standard ? {...offer, activeType: this.bonusTypes.STANDARD} : offer
      });
      this.slides=[...this.slides]
      this.highRoller=this.slides.filter((res)=>{ return res.highroller});
      this.standard=this.slides.filter((res)=>{ return res.standard})
      

      // this.slickModal?.initSlick();
      // }
      this.title=data.title;
      if(this.page!=='Bonus of Day'){
      this.getAPIData();
      }
    }
    // });
  }

  afterChange(e){
    this.slickModal?.unslick();
    this.slickModal?.initSlick();
  }

  changeType(event,offer) {
    if(event.target.checked){
      offer.activeType=this.bonusTypes.HIGHROLLER;
    } else {
      offer.activeType=this.bonusTypes.STANDARD;
    }
  }

  changeBonusType(event) {
    if(event.target.checked){
      this.activeBonusType=this.bonusTypes.HIGHROLLER;
    } else {
      this.activeBonusType=this.bonusTypes.STANDARD;
    }
    this.displayBonusType=this.translate.instant(`title.${this.activeBonusType}`);
  }

  filterOffers(promotions) {
    // this.filteredSlides=[];
    let slides=[]
    let d = new Date();
    promotions.forEach((offer) => {
      if (typeof (offer.deposit) == PROMOTION_BONUSES_TYPE.NUMBER) {
        if( offer.deposit == this.depositsCount + 1){
        slides.push(offer);
        }
      } else {
        if (offer.deposit == WEEKDAYS[d.getDay()]) {
          slides.push(offer);
        }
        else if (offer.deposit == PROMOTION_BONUSES_TYPE.CASHBACK) {
          slides.push(offer);
        }
      }
    });
    this.filteredSlides=[...slides]
  }

  ngOnInit(): void {
    this.displayBonusType=this.translate.instant(`title.${this.activeBonusType}`);
    if(!this.page) {
      this.page='Bonus of Day';
    }
    if (window.innerWidth <= DEFAULT_VALUES.MOBILE_SIZE) {
      this.slideConfig.slidesToShow = 1;
    }
    this.getData();
  }

  onClick(event) {
    if(this.authService.isAuthenticated()) {
      this.ngModal.open(DepositsComponent, {
        size: 'lg',
        keyboard: false,
        windowClass: 'modal-active'
      });
    } else {
      if(this.isPNPAllowed) {
        let modalRef=this.ngModal.open(PayNPlayModalComponent, {
          size: 'md',
          keyboard: false,
          windowClass: 'pnp-modal',
          centered: true
        });
        modalRef.componentInstance.type=MODALS.LOGIN;
      } else {
      this.modalService.openModal(LoginComponent);
      }
    }
  }

  navigate(link:string){
    this.router.navigateByUrl(link);
  }

  ngOnDestroy(){
    this.filteredSlides=[];
    this.highRoller=[];
    this.standard=[];
  }


}
