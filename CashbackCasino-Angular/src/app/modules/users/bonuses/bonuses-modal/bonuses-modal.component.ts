import { AlertService } from './../../../../core/services/alert.service';
import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpService, AuthService } from 'src/app/core/services';
import { APIS, DEFAULT_VALUES, OFFER_TYPES, ACTIVE_BONUS_STAGES, ACTIVE_FREESPIN_STAGES } from 'src/app/common/constants';
import * as moment from 'moment';
import * as _ from 'lodash';
import { Observable, timer, forkJoin, interval } from 'rxjs';
import { BONUSES, FREESPINS } from 'src/app/core/mocks/Bonuses';
import { map } from 'rxjs/operators';
import { BonusFreespinsService } from 'src/app/core/services/bonus-freespins.service';
import { HeaderService } from 'src/app/core/services/header.service';

@Component({
  selector: 'app-bonuses-modal',
  templateUrl: './bonuses-modal.component.html',
  styleUrls: ['./bonuses-modal.component.scss']
})
export class BonusesModalComponent implements OnInit {

  activeBonusStages = Object.values(ACTIVE_BONUS_STAGES);
  activeFreespinsStages = Object.values(ACTIVE_FREESPIN_STAGES);
  offers = [];
  offerTypes = OFFER_TYPES;
  timeleft;
  issuedBonuses = [];
  registrationBonuses = [];
  activeBonuses = [];
  allCurrencies = [];
  inventory = [];
  issuedFreeSpins = [];
  activeFreespins = []
  offersCount;
  isLoggedIn: boolean;
  showSidebar: boolean;
  noFreespins=0;

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
    private router: Router,
    private activeModal: NgbActiveModal,
    private httpService: HttpService,
    private authService: AuthService,
    private alertService: AlertService,
    private bonusService:BonusFreespinsService,
    private headerService:HeaderService
  ) {
    if (window.innerWidth <= DEFAULT_VALUES.MOBILE_SIZE) {
      this.showSidebar = true;
    }
  }

  ngOnInit(): void {
    // First we get the viewport height and we multiple it by 1% to get a value for a vh unit
    let vh = window.innerHeight * 0.01;
    // Then we set the value in the --vh custom property to the root of the document
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    this.getPlayerBonuses();
  }

  changeTab(e) {
    if (typeof this.showSidebar === "boolean") {
      this.showSidebar = false;
    }
  }

  getTotalCount(event) {
    this.offersCount = event;
  }

  getPlayerBonuses() {
    this.authService.authentication.subscribe((res) => {
      console.log("check")
      this.isLoggedIn = !!res;
      if (res) {
        // forkJoin([this.httpService.getData(APIS.PLAYER.BONUSES), this.httpService.getData(APIS.PLAYER.FREESPINS), this.httpService.getData(APIS.CURRENCIES)]).subscribe(results => {
        //   this.filterActiveOffers(results[0].body, results[1].body);
        //   this.allCurrencies = results[2].body;
        //   // this.filterActiveOffers(BONUSES, FREESPINS);
        // });
        let bonusData=this.bonusService.getData();
        let playerData=this.headerService.getPlayerData();
        this.filterActiveOffers(bonusData.bonuses,bonusData.freespins);
        this.allCurrencies=playerData.currencies;
      } 
    })
    
  }

  closeModal() {
    this.activeModal.close();
  }

  activate(offer) {
    if (offer.type == OFFER_TYPES.BONUS) {
      this.httpService.postData(APIS.PLAYER.ACTIVATE_BONUS.replace(':id', offer.id)).subscribe((res) => {
        this.getBonusesAndFreespins();
      });
    }
    else if (offer.type == OFFER_TYPES.FREESPIN) {
      this.httpService.postData(APIS.PLAYER.ACTIVATE_FREESPIN.replace(':id', offer.id)).subscribe((res) => {
        this.getBonusesAndFreespins();
      });
    }
  }

  goTo(route) {
    this.router.navigate([route]);
    this.closeModal();
  }

  cancel(offer) {
    this.alertService.confirm(`Do you want to cancel ${offer.title}?`).then(res => {
      if (res.value) {
        if (offer.type == OFFER_TYPES.BONUS) {
          this.httpService.deleteData(APIS.PLAYER.DELETE_BONUS.replace(':id', offer.id)).subscribe((res) => {
            this.getBonusesAndFreespins();
          })
        }
        else if (offer.type == OFFER_TYPES.FREESPIN) {
          this.httpService.deleteData(APIS.PLAYER.DELETE_FREESPIN.replace(':id', offer.id)).subscribe((res) => {
            this.getBonusesAndFreespins();
          });
        }
      }
    })
  }

  getBonusesAndFreespins() {
    forkJoin([this.httpService.getData(APIS.PLAYER.BONUSES), this.httpService.getData(APIS.PLAYER.FREESPINS)]).subscribe(results => {
        this.filterActiveOffers(results[0].body, results[1].body);
        // this.filterActiveOffers(BONUSES, FREESPINS);
      });
  }

  filterActiveOffers(bonuses, freespins) {
    this.activeBonuses=[];
    this.issuedBonuses=[];
    this.activeFreespins=[];
    this.issuedFreeSpins=[];
    //Filtering active and issued Bonuses
    this.activeBonuses = _.filter(bonuses, (bonus) => {
      bonus = this.addWageredPercentField(bonus);
      bonus.type = OFFER_TYPES.BONUS;
      return this.activeBonusStages.indexOf(bonus.stage) >= 0 && !bonus.activatable
    });
    this.issuedBonuses = bonuses.filter((bonus) => {
      return bonus.activatable;
    });
    //Filtering active and issued freespins
    this.activeFreespins = _.filter(freespins, (spin) => {
      spin.type = OFFER_TYPES.FREESPIN;
      return spin.stage == ACTIVE_FREESPIN_STAGES.ACTIVE
    });
    this.issuedFreeSpins = freespins.filter((spin) => {
      return spin.stage == ACTIVE_FREESPIN_STAGES.ISSUED && spin.activatable;
    });

    //Merging active and issued freespins and bonuses
    this.offers=[];
    this.inventory=[];
    this.inventory = this.activeBonuses.concat(this.activeFreespins);
    this.offers = this.issuedBonuses.concat(this.issuedFreeSpins);
}

  getDays(end) {
    let endDate = new Date(end);
    let diff;
    diff = Math.floor((endDate.getTime() - new Date().getTime()) / 1000);
    let days = Math.floor(diff / 86400);
    return days;
  }

  getTwoDigitNumber(d) {
    return (d < 10 ? '0' : '') + String(d);
  }

  addWageredPercentField(bonus) {
    bonus.wageredPercent = Math.round((bonus.amount_wager_cents / (bonus.amount_wager_requirement_cents || 1)) * 100);
    return bonus;
  }

  countDown(givenDate?) {
    const deadline = new Date('2020-06-29').getTime();
    timer(1000, 1000)
      .pipe(
        map((x: number) => {
          let now = new Date().getTime();
          const newDate = new Date(deadline - now);
          newDate.setSeconds(newDate.getSeconds());
          return newDate;
        })
      )
      .subscribe(t => this.timeleft = t);
  }

  playNow(offer) {
    this.goTo(`/users/${offer.type}/${offer.id}`)
  }

}
