import { Injectable, Injector } from '@angular/core';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { HttpService } from './http.service';
import { APIS } from 'src/app/common/constants';
import { RealTimeService } from './real-time.service';
import { NotificationService } from './notification.service';
import * as _ from 'lodash';
@Injectable({
    providedIn: 'root'
  })
  export class BonusFreespinsService {
    bonuses= new BehaviorSubject(null);
    freespins= new BehaviorSubject(null);
    depositBonuses=new BehaviorSubject(null);
    private notificationService;
    private httpService;
    private realTimeService;

    constructor(private injector: Injector) {
       this.notificationService =this.injector.get(NotificationService);
       this.httpService=this.injector.get(HttpService);
       
    }

    fetchBonusesAndFreespins() {
        forkJoin([this.httpService.getData(APIS.PLAYER.BONUSES), this.httpService.getData(APIS.PLAYER.FREESPINS)]).subscribe((results:any) => {
            this.bonuses.next(results[0].body);
            this.freespins.next(results[1].body);
        });
    }

    fetchDepositBonus() {
        forkJoin([this.httpService.getData(APIS.BONUS_PREVIEW.DEPOSIT_BONUSES), this.httpService.getData(APIS.STATUSES)]).subscribe((results:any) => {
            this.depositBonuses.next({bonuses:results[0].body,statuses:results[1].body});
        });
    }

    getDepositbonuses() {
        if(this.depositBonuses.value) {
            return this.depositBonuses.value;
        }
    }

    subscribeRealTimeData() {
        this.realTimeService=this.injector.get(RealTimeService);
        // let data={
        //     "id": 12,
        //     "title": "Netent Freespins",
        //     "freespins_total": 9,
        //     "freespins_performed": null,
        //     "stage": "issued",
        //     "games": [
        //         "netent/attraction_sw"
        //     ],
        //     "activation_path": "deprecated/do/not/use",
        //     "provider": "netent",
        //     "activatable_until": "2020-10-20T04:53:34.477Z",
        //     "valid_until": null,
        //     "activatable": true,
        //     "activation_condition": null,
        //     "cancelable": true
        // }
        // this.freespinUpdated(data);
        this.realTimeService.subscribe('bonuses_changes#', (resp:any) => {
            this.bonusUpdated(resp.data);
        });
        this.realTimeService.subscribe('freespins_changes#', (resp:any) => {
            this.freespinUpdated(resp.data);
        });
    }

    freespinUpdated(updatedFreespin) {
        let freespins=this.freespins.value;
        if(freespins) {
        let foundUpdatedSpin=freespins.find((spin)=>{
            return updatedFreespin.id==spin.id
        });
        if(foundUpdatedSpin) {
            this.notificationService.onFreespinsUpdated("freespin",{current:updatedFreespin,previous:foundUpdatedSpin});
            freespins = _.reject(freespins, { id: updatedFreespin.id });
        } 
        }else {
            this.notificationService.onFreespinsAdded("freespin",updatedFreespin);
        }
        freespins.push(updatedFreespin);
        this.freespins.next(freespins);
    }

    bonusUpdated(updatedBonus) {
        let bonuses=this.bonuses.value;
        let foundUpdatedBonus=bonuses.find((bonus)=>{
            return updatedBonus.id==bonus.id
        });
        if(foundUpdatedBonus) {
            this.notificationService.onBonusUpdated("bonus",{current:updatedBonus,previous:foundUpdatedBonus});
            bonuses = _.reject(bonuses, { id: updatedBonus.id });

        } else {
            this.notificationService.onBonusAdded("bonus",updatedBonus);
        }
        bonuses.push(updatedBonus);
        this.bonuses.next(bonuses);
    }

    getData() {
        return {bonuses:this.bonuses.value,freespins:this.freespins.value};
    }

    initSubscriptions() {
        this.fetchBonusesAndFreespins();
        this.subscribeRealTimeData();
    }
  }