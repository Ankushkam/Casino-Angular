import { Component, OnInit, Input, OnDestroy, ViewEncapsulation } from '@angular/core';
import { ModalService, SharedService, HttpService } from 'src/app/core/services';
import { DepositsComponent } from 'src/app/modules/users/payments/deposits/deposits.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MODALS, APIS, WEEKDAYS,PROMOTION_BONUSES_TYPE, BONUS_PROMOS } from 'src/app/common/constants';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { PayNPlayModalComponent } from '../../../modules/shared/pay-n-play-modal/pay-n-play-modal.component';
import { Router } from '@angular/router';
import { SignupComponent } from 'src/app/modules/auth/signup/signup.component';
import { LoginComponent } from 'src/app/modules/auth/login/login.component';

@Component({
  selector: 'app-promotions-card',
  templateUrl: './promotions-card.component.html',
  styleUrls: ['./promotions-card.component.scss'],
  encapsulation:ViewEncapsulation.None
})
export class PromotionsCardComponent implements OnInit,OnDestroy {

  // @Input() params;
  @Input() link;
  playerStats;
  promotions;
  depositsCount=0;
  filteredOffers=[];
  subscriptions: Array<Subscription> = [];
  bonusTypes=PROMOTION_BONUSES_TYPE;
  activeBonusType=PROMOTION_BONUSES_TYPE.STANDARD;
  displayBonusType;
  isPNPAllowed: boolean;
  constructor(private modalService:ModalService,private router:Router,private translate:TranslateService,private httpService:HttpService, private ngModal:NgbModal,private sharedService:SharedService) { }

  ngOnInit(): void {
    this.displayBonusType=this.translate.instant(`title.${this.activeBonusType}`);
    // this.params=JSON.parse(this.params);
    this.getPromotionalOffers();
    this.sharedService.pnpAlowed.subscribe(res=>{
      this.isPNPAllowed=res;
    });
  }

  getAPIData() {
    this.httpService.getData(APIS.PLAYER.STATS).subscribe((res)=>{
      if(res.body){
      this.depositsCount=res?.body?.deposits_count || 0;
      }
      // this.filterOffers(this.promotions);
      this.filteredOffers=[...this.promotions];
      
    })
  }

  filterOffers(promotions) {
    this.filteredOffers=[];
    let d = new Date();
    if(promotions?.length>0){
    promotions.forEach((offer) => {
      if (typeof (offer.deposit) == this.bonusTypes.NUMBER) {
        if( offer.deposit == this.depositsCount + 1){
        this.filteredOffers.push(offer);
        }
      } else {
        if (offer.deposit == WEEKDAYS[d.getDay()]) {
          this.filteredOffers.push(offer);
        }
        else if (offer.deposit == this.bonusTypes.CASHBACK) {
          this.filteredOffers.push(offer);
        }else{
          this.filteredOffers.push(offer);
        }
      }

    })
  }
  }

  getPromotionalOffers() {
    this.subscriptions[0] = this.sharedService.snippets.subscribe(res => {
      if(res.length>0){
        let data = JSON.parse(res.find(snippet => snippet.id == "bonus-of-day")?.content);
      this.promotions=data?.offers;
      this.promotions=this.promotions.filter((offer)=>{
          return !offer.key || offer.key==BONUS_PROMOS.NORMAL
      })
      this.promotions=this.promotions.map(offer => {
        return offer?.highroller && offer.standard ? {...offer, activeType: this.bonusTypes.STANDARD} : offer
      });
      this.getAPIData();
      }
    });
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

  getItNow() {
    if(this.link==MODALS.LOGIN) {
      if(this.isPNPAllowed) {
        let modalRef=this.ngModal.open(PayNPlayModalComponent, {
          size: 'md',
          keyboard: false,
          windowClass: 'pnp-modal',
          centered: true
        });
        modalRef.componentInstance.type=MODALS.SIGNUP;
      } else {
      this.modalService.openModal(LoginComponent);
      }
    } 
    else if(this.link==MODALS.DEPOSIT) {
      this.ngModal.open(DepositsComponent, {
        size: 'lg',
        keyboard: false,
        windowClass: 'modal-active'
      });
    }
  }

  navigate(link:string){
    this.router.navigateByUrl(link);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub =>{
        sub.unsubscribe();
    });
  }

}
