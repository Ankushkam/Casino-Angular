import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { Component, OnInit,ElementRef } from '@angular/core';
import { NgcNoCookieLawEvent, NgcStatusChangeEvent, NgcInitializeEvent, NgcCookieConsentService, NgcCookieConsentConfig } from 'ngx-cookieconsent';
import { PushNotificationService } from './core/services/push-notification.service'
import { AuthService, RealTimeService, SharedService, HttpService, ModalService } from './core/services';
import { PaymentsService } from './core/services/payments.service';
import { TournamentsService } from './core/services/tournaments.service';
import { BonusFreespinsService } from './core/services/bonus-freespins.service';
import { GamesService } from './components/home/games/games.service';
import { CookieService } from 'ngx-cookie-service';
import { APIS, USER_DETAILS } from './common/constants';
import { TranslateService } from '@ngx-translate/core';
import { BnNgIdleService } from 'bn-ng-idle';
import { UpdatetermsComponent } from './modules/users/updateterms/updateterms.component';
import { filter } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { RestrictionsService } from './core/services/restrictions.service';
declare var gtag

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  title = 'Welcome to Cashback Casino';
  isLoggedIn;
  isRestricted;
  sessionDate;
  isHidden;
  onLangChange: Subscription = undefined;
  private popupOpenSubscription: Subscription;
  private popupCloseSubscription: Subscription;
  private initializeSubscription: Subscription;
  private statusChangeSubscription: Subscription;
  private revokeChoiceSubscription: Subscription;
  private noCookieLawSubscription: Subscription;
  private notificationsSubscription: Subscription;


  constructor(public el: ElementRef,private cookieService: CookieService, private translate: TranslateService,private restrictionService:RestrictionsService, private gameService: GamesService, private httpService: HttpService, private ccService: NgcCookieConsentService, private sharedService: SharedService, private realTimeService: RealTimeService, private paymentService: PaymentsService, private tournamentService: TournamentsService, private bonusService: BonusFreespinsService, private authService: AuthService, private config: NgcCookieConsentConfig, private pushNotificationService: PushNotificationService, private router: Router, private bnIdle: BnNgIdleService, private modalService: ModalService) {
    this.initGtag(router);
  }

  ngOnInit() {
    // this.modalService.openModal(UpdatetermsComponent,{playerData:{auth_fields_missed: ["email", "terms_acceptance"]}})

    this.initSubscriptions()
    this.fetchData();
  }

  initSubscriptions() {
    this.updateCookiePolicyTranslatedText()
    if(this.router.url.includes('forbidden')){
      this.isRestricted=true;
    } else{
      this.isRestricted=false;
    }

    //Logs out user after 60 minutes
    this.bnIdle.startWatching(3600).subscribe((isTimedOut: boolean) => {
      if (isTimedOut && this.isLoggedIn) {
        this.authService.logout();
      }
    });

    this.updateLanguage();
    this.onLangChange = this.translate.onLangChange.subscribe(() => {
      this.updateLanguage();
      //init cookie policy text translations
      this.updateCookiePolicyTranslatedText()
    });

    //subscription for supprt icon visibilty
    this.sharedService.isSupportHidden.subscribe((res) => {
      this.isHidden = res;
    })

    //Notifications subscription if user is logged in
    this.notificationsSubscription = this.authService.authentication.subscribe((res) => {
      this.isLoggedIn = res;
      // Fetch data on user login
      if (res) {
        this.realTimeService.get_config();
        this.authService.subscribeRealtimeEvents();
        this.tournamentService.initSubscriptions();
        this.paymentService.initSubscriptions();
        this.bonusService.initSubscriptions();
        this.gameService.initSubscriptions();
        this.sharedService.initSubscriptions();
        if (!this.authService.getUserData(USER_DETAILS.Currency)) {
          this.httpService.getData(APIS.PLAYER.DATA).subscribe(resp => {
            this.authService.saveUserData(resp.body);
            if (resp.body?.auth_fields_missed?.length > 0 && !this.sharedService.isTermsOpen.value) {
              this.sharedService.openTermsPage(true);
              this.modalService.openModal(UpdatetermsComponent, { playerData: resp?.body });
            }
          });
        }

      } else {
        this.sharedService.getCurrentIP();
        this.cookieService.deleteAll('/');
        sessionStorage.clear();
      }
    });

    // Initialize one signal push notifications
    this.pushNotificationService.init();

    // subscribe to cookieconsent observables to react to main events
    this.popupOpenSubscription = this.ccService.popupOpen$.subscribe(
      () => {
        // you can use this.ccService.getConfig() to do stuff...
      });

    this.popupCloseSubscription = this.ccService.popupClose$.subscribe(
      () => {
        // you can use this.ccService.getConfig() to do stuff...
      });

    this.initializeSubscription = this.ccService.initialize$.subscribe(
      (event: NgcInitializeEvent) => {
        // you can use this.ccService.getConfig() to do stuff...
      });

    this.statusChangeSubscription = this.ccService.statusChange$.subscribe(
      (event: NgcStatusChangeEvent) => {
        localStorage.setItem('acceptCookie', 'true')
        this.ccService.fadeOut();
        this.config.autoOpen = false;
        // you can use this.ccService.getConfig() to do stuff...
      });

    this.revokeChoiceSubscription = this.ccService.revokeChoice$.subscribe(
      () => {
        // you can use this.ccService.getConfig() to do stuff...
      });

    this.noCookieLawSubscription = this.ccService.noCookieLaw$.subscribe(
      (event: NgcNoCookieLawEvent) => {
        // you can use this.ccService.getConfig() to do stuff...
      });

    this.router.events.subscribe(res => {
      if (res instanceof NavigationEnd) {
        window.scrollTo(0, 0 - 100000)

      }
    })

  }

  fetchData(){
    this.isUserLoggedIn();
    this.restrictionService.applyRestrictions();
    this.authService.setUserData(USER_DETAILS.Locale, this.translate.currentLang);
    this.sharedService.setSnippetsData();
    this.httpService.getData(APIS.CURRENT_IP).subscribe((res)=>{
     if(res?.body?.country_code=='SE'){
        if(!this.router.url.includes('en-en') && !window.location.pathname.includes('promo') && !window.location.pathname.includes('payandplaytest')){
          if(window.location.pathname=='/' || window.location.pathname=='/en'){
            this.router.navigate(['/en-en'])
          }
        }
      }
    })
    // this.sharedService.session.subscribe((res)=>{
    //   if(res) {
    //   this.sessionDate=new Date(res.created_at);
    //   }
    // })
  }

  initGtag(router){
    const navEndEvent$ = router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    );
    navEndEvent$.subscribe((e: NavigationEnd) => {
      gtag('config', environment.gtagKey, {'page_path':e.urlAfterRedirects});
      // gtag('event', 'conversion', {'send_to': 'AW-660192536/AtikCJfcovUBEJj65roC'});
    });
  }

  isUserLoggedIn() {
        if(!this.sharedService.playerData.value || !this.sharedService.playerData.value.locale) {
            this.httpService.getData(APIS.PLAYER.DATA).subscribe((res) => {
              if(res.body.id){
                this.sharedService.hideTabs((res.body?.can_issue_bonuses)?null:["loyalty_program"])
                this.sharedService.playerData.next((res || {}).body);
                this.authService.updateUserDetails(res?.body);
                this.cookieService.set(USER_DETAILS.IsLoggedIn,'true')
                this.authService.authentication.next(true);
              } 
              if(!res?.body?.mobile_phone && res.body?.auth_fields_missed?.length == 0){
                this.sharedService.openTermsPage(true);
                this.modalService.openModal(UpdatetermsComponent,{step:2,playerData:res?.body})
              }
            })
        } else {
          this.sharedService.hideTabs((this.sharedService?.playerData?.value?.can_issue_bonuses)?null:['loyalty_program'])
             this.cookieService.set(USER_DETAILS.IsLoggedIn,'true')
             this.authService.authentication.next(true);
             if(!this.sharedService?.playerData?.value?.mobile_phone && this.sharedService?.playerData?.value?.auth_fields_missed?.length == 0){
              this.sharedService.openTermsPage(true);
              this.modalService.openModal(UpdatetermsComponent,{step:2,playerData:this.sharedService?.playerData?.value})
            }
        }
  
}

 /**
   * Update the language in the lang attribute of the html element.
   */
  updateLanguage(): void {
    const lang = document.createAttribute('lang');
    lang.value = this.translate.currentLang;
    this.el.nativeElement.parentElement.parentElement.attributes.setNamedItem(lang);
  }

  updateCookiePolicyTranslatedText(){
    this.translate//
      .get(['links_text.cookie_policy', 'text.cookie_message', 'text.allow','links_text.privacy_policy','text.tosLink'])
      .subscribe(data => {
        this.ccService.getConfig().content = this.ccService.getConfig().content || {} ;
        // Override default messages with the translated ones
        this.ccService.getConfig().content.message = data['text.cookie_message'];
        // this.ccService.getConfig().content.dismiss = data['cookie.dismiss'];
        this.ccService.getConfig().content.allow = data['text.allow'];
        this.ccService.getConfig().content.cookiePolicyLink = data['links_text.cookie_policy'];
        this.ccService.getConfig().content.privacyPolicyLink = data['links_text.privacy_policy'];
        this.ccService.getConfig().content.tosLink = data['text.tosLink'];
 
        this.ccService.destroy();//remove previous cookie bar (with default messages)
        this.ccService.init(this.ccService.getConfig()); // update config with translated messages
      });

  }


  ngOnDestroy() {
    // unsubscribe to cookieconsent observables to prevent memory leaks
    this.popupOpenSubscription.unsubscribe();
    this.popupCloseSubscription.unsubscribe();
    this.initializeSubscription.unsubscribe();
    this.statusChangeSubscription.unsubscribe();
    this.revokeChoiceSubscription.unsubscribe();
    this.noCookieLawSubscription.unsubscribe();
    if (this.onLangChange !== undefined) {
      this.onLangChange.unsubscribe();
    }
  }
}
