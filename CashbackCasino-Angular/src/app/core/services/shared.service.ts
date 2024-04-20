import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { CurrentLevel } from '../interfaces';
import { HttpService } from './http.service';
import { APIS} from 'src/app/common/constants';
import { RealTimeService } from './real-time.service';
import { NotificationService } from './notification.service';
import { PayNPlayResolver } from './pay-n-play.resolver';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
    providedIn: 'root'
})
export class SharedService {
    constructor(private httpService: HttpService,private translate:TranslateService,private pnpService: PayNPlayResolver, private realTimeService: RealTimeService, private notificationsService: NotificationService) { }
    /** -- Handle current level after login */
    private defaultLevel: CurrentLevel = { id: "level_1", level: 1, progress: 0, points: 0, minPoints: 0, maxPoints: 0 };
    private currentLevel = new BehaviorSubject<CurrentLevel>(this.defaultLevel);
    private previousLevel = new BehaviorSubject<CurrentLevel>(this.defaultLevel);
    session = new BehaviorSubject(null);
    defaultLocale = new BehaviorSubject(null);
    htmlContent = new BehaviorSubject(null);
    currentLevel$ = this.currentLevel.asObservable();
    previousLevel$ = this.previousLevel.asObservable();
    currentIP = new BehaviorSubject(null);
    pnpAlowed = new BehaviorSubject(false);
    snippets = new BehaviorSubject<any>([]);
    playerData= new BehaviorSubject(null);
    isSupportHidden = new BehaviorSubject(false);
    isSnippetsUpdated = new BehaviorSubject(false);
    allCurrencies=[];
    isCurrenciesUpdated= new BehaviorSubject(false);
    isHideTabs= new BehaviorSubject(null);
    isHideBonuses=new BehaviorSubject(false);
    isHideCashbackBonus= new BehaviorSubject(false);
    isHidePNP=new BehaviorSubject(false);
    isTermsOpen=new BehaviorSubject(false);

    updateCurrentLevel(updatedObj: CurrentLevel,prevLevel?:CurrentLevel) {
        let obj = { ...this.currentLevel.value, ...updatedObj };

        obj.progress = ((obj.points - obj.minPoints) / (obj.maxPoints - obj.minPoints)) * 100;
        this.currentLevel.next(obj);
        this.previousLevel.next(prevLevel);
    }

    hideSupportIcon(status) {
        this.isSupportHidden.next(status);
    }

    hideTabs(tabsArr) {
        this.isHideTabs.next(tabsArr);
    }

    hideCashbackBonus(status) {
        this.isHideCashbackBonus.next(status);
    }

    hideBonuses(status){
        this.isHideBonuses.next(status);
    }

    hidePNP(status){
        this.isHidePNP.next(status);
    }

    getDefaultLevel() {
        this.currentLevel.next(this.defaultLevel);
        this.checkLevelUpdate(this.currentLevel);
    }

    openTermsPage(status){
        this.isTermsOpen.next(status);
    }

    updateData(status){
        this.isCurrenciesUpdated.next(status);
    }

    checkLevelUpdate(dataObj: any) {
        // if (dataObj && dataObj.id) {
            this.httpService.getData(APIS.GROUPS).subscribe(resp => {
                let level = resp.body.find(obj => obj?.id == dataObj?.id && obj?.conditions.length);
                if (level) {
                    let prevLevel=resp.body.find(obj => obj.id == `${(dataObj?.id.split('_')[0])}_${+(dataObj?.id.split('_')[1] || 0)+1}` && obj.conditions.length);
                    let obj = { id: level.id,type:level.id.split('_')[0], level: level.id.split('_')[1], minPoints: level.conditions[0].persistent_comp_points.min, maxPoints: +level.conditions[0].persistent_comp_points.max+1 };
                    let prevObj;
                    if(prevLevel){
                    prevObj= { id: prevLevel.id, type:prevLevel.id.split('_')[0],level: prevLevel.id.split('_')[1], minPoints: prevLevel.conditions[0].persistent_comp_points.min, maxPoints: prevLevel.conditions[0].persistent_comp_points.max };
                    }
                    this.updateCurrentLevel(obj,prevObj);
                } else {
                    let prevObj;
                    let prevLevel=resp.body.find(obj => obj.id == `level_1` && obj.conditions.length);
                    let obj = { id: 'level_0', type:'level', level: 0, minPoints: 0, maxPoints: prevLevel?.conditions[0]?.persistent_comp_points?.min};
                    if(prevLevel){
                        prevObj= { id: prevLevel.id, type:prevLevel.id.split('_')[0],level: prevLevel.id.split('_')[1], minPoints: prevLevel.conditions[0].persistent_comp_points.min, maxPoints: prevLevel.conditions[0].persistent_comp_points.max };
                    }
                    this.updateCurrentLevel(obj,prevObj);
                }
            });
        // }
    }

    subscribeRealTimeCompointsChanges() {
        this.realTimeService.subscribe('comps_award#', (resp) => {
            this.fetchPlayerLevel({ points: resp.data.persistent?.points || 0 });
        });
    }
    subscribeRealTimeGroupChanges() {
        this.realTimeService.subscribe('groups_updates#', (resp) => {
            // this.notificationsService.groupChanges("group", resp.data);
        });
    }

    /** -- Handle snippets data */
    // private snippets = new BehaviorSubject<any>([]);
    // snippets$ = this.snippets.asObservable();
    setSnippetsData() {
        let data={};
            data={l:this.translate.currentLang}
        this.httpService.getData(APIS.CMS.SNIPPETS,data).subscribe(resp => {
            this.snippets.next(resp.body);
            this.isSnippetsUpdated.next(true);
        });
    };

    /** -- Handle player data */

    fetchCompoints() {
        forkJoin([
            this.httpService.getData(APIS.PLAYER.DATA),
            this.httpService.getData(APIS.PLAYER.COMP_POINTS)
        ]).subscribe(resp => {
            this.checkLevelUpdate(resp[0].body.statuses.find(obj => obj.id.includes('level_') || obj.id.includes('vip_')));
            this.updateCurrentLevel({ points: resp[1].body.persistent?.points || 0 });
        })
    }

    fetchPlayerLevel(obj) {
        forkJoin([
            this.httpService.getData(APIS.PLAYER.DATA),
            this.httpService.getData(APIS.PLAYER.COMP_POINTS)
        ]).subscribe(resp => {
            this.playerData.next(resp[0].body);
            this.checkLevelUpdate(resp[0].body.statuses.find(obj => obj.id.includes('level_') || obj.id.includes('vip_')));
            this.updateCurrentLevel({ points: resp[1].body.persistent?.points || 0 });
            this.notificationsService.onStatusChanged('status', this.currentLevel.value);
        })
    }
    /** -- Handle setting data */

    /**Fetch session list */
    fetchCurrentSession() {
        this.httpService.getData(APIS.SESSION_LIST).subscribe((res) => {
            let currentSession = res.body.find(session => {
                return session.current;
            });
            if (currentSession) {
                // this.sessionTime.next(currentSession.created_at);
                this.session.next(currentSession);
            }
            if (res.body.length > 1) {
                for (var i = 0; i < res.body.length; i++) {
                    if (res.body[i].current != true) {
                        this.closeSession(res.body[i].id)
                    }
                }
            }
        })
    }

    getCurrentIP() {
        this.httpService.getData(APIS.CURRENT_IP).subscribe((res) => {
            this.currentIP.next(res.body);
            if(res?.body?.country_code=='SE'){
                this.hideCashbackBonus(true);
                this.hideBonuses(true);
                this.hideTabs(['loyalty_program','promotions'])
            }
            if(res?.body?.country_code=='FI'){
                this.hideCashbackBonus(false);
                this.hideBonuses(true);
                this.hideTabs(['loyalty_program'])
            }
            this.pnpAlowed.next(this.pnpService.isCountryAllowed(res.body.country_code) ? true : false);
        });
        this.httpService.getData(APIS.CURRENCIES).subscribe((res) => {
            this.allCurrencies=res.body;
        });
    }

    getIP(){
        return this.currentIP.value;
    }
    closeSession(id) {
        // let sessionId = this.session.value.id;
        let sessionId = id;
        this.httpService.deleteData(`${APIS.SESSION_LIST}/${sessionId}`).subscribe((res) => {
        });
    }
    getDefaultLocale() {
        this.httpService.getData(APIS.INFO.LOCALE).subscribe((res) => {
            let defaultLocale = res.body.find(locale => {
                return locale.default;
            });
            if (defaultLocale) {
                this.defaultLocale.next(defaultLocale.code);
            }
        })
    }

    isPNPLogin(){
        this.httpService.getData(APIS.CONNECTED_SOCIAL_PROVIDERS).subscribe((res)=>{
          let isPNPAllowed=(res?.body[0]?.type=='pay_n_play')? true:false;
          this.pnpAlowed.next(isPNPAllowed);
        })
      }

    initSubscriptions() {
        this.fetchCompoints();
        this.getCurrentIP();
        this.fetchCurrentSession();
        this.subscribeRealTimeCompointsChanges();
        this.subscribeRealTimeGroupChanges();
        this.setSnippetsData();

        // this.getDefaultLocale();
    }
}