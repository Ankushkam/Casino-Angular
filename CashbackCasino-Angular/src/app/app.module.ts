import { SupportComponent } from './components/support/support.component';
import { environment } from './../environments/environment';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA, APP_INITIALIZER } from '@angular/core';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { HTTP_INTERCEPTORS, HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { FormsModule } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { NgcCookieConsentModule, NgcCookieConsentConfig, NgcPaletteOptions } from 'ngx-cookieconsent';
import { LivechatWidgetModule } from '@livechat/angular-widget'


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpRequestInterceptor } from './core/interceptors/http-request.interceptor';
import { HttpService } from './core/services/http.service';
import { SharedModule } from './modules/shared/shared.module';
import { HomeComponent } from './components/home/home.component';
import { GamesComponent } from './components/home/games/games.component';
import { UsersModule } from './modules/users/users.module';
import { HowItWorkComponent } from './components/how-it-work/how-it-work.component';
import { ProvidersComponent } from './components/home/providers/providers.component';
import { GamesListComponent } from './components/home/games-list/games-list.component';
import { CategoryGamesComponent } from './components/category-games/category-games.component';
import { CasinoComponent } from './components/casino/casino.component';
import { GamePlayComponent } from './components/game-play/game-play.component';
import { RealTimeService } from './core/services';
import { TournamentsComponent } from './components/tournaments/tournaments.component';
import { CasinoTournamentComponent } from './components/tournaments/casino-tournament/casino-tournament.component';
import { TournamentBannerComponent } from './components/tournaments/tournament-banner/tournament-banner.component';
import { TournamentHeaderComponent } from './components/tournaments/tournament-header/tournament-header.component';
import { TournamentBottomComponent } from './components/tournaments/tournament-bottom/tournament-bottom.component';
import { TournamentCardComponent } from './components/tournaments/new-tournament/tournament-card.component';
import { APP_BASE_HREF } from '@angular/common';
import { StaticInfoPagesComponent } from './components';
import { USER_DETAILS, DEFAULT_VALUES, COUNTRIES_LOCALES, APIS, RESTRICTED_COUNTRIES } from './common/constants';
import { PromotionsComponent } from './components/promotions/promotions.component';
import { PromotionsHeadComponent } from './components/promotions/promotions-head/promotions-head.component';
import { PromotionsCardComponent } from './components/promotions/promotions-card/promotions-card.component';
import { CurrentTournamentComponent } from './components/promotions/current-tournament/current-tournament.component';
import { CasinoPromotionsComponent } from './components/promotions/casino-promotions/casino-promotions.component';
import { PromotionsBottomComponent } from './components/promotions/promotions-bottom/promotions-bottom.component';
import { DynamicHTMLModule } from './modules/dynamic-html';
import { NgSlimScrollModule, SLIMSCROLL_DEFAULTS, ISlimScrollOptions } from 'ngx-slimscroll';
import { FaqCardsComponent } from './components/home/faq-cards/faq-cards.component';
import { BnNgIdleService } from 'bn-ng-idle';
import { NotfoundComponent } from './notfound/notfound.component';
import { StrengthMeterModule } from "ngx-strength-meter";
import { RegistrationProcedureComponent } from './registration-procedure/registration-procedure.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';

// import { DeviceDetectorService } from 'ngx-device-detector';

const cookieConfig: NgcCookieConsentConfig = {
  cookie: {
    domain: 'http://localhost:4200' // or 'your.domain.com' // it is mandatory to set a domain, for cookies to work properly (see https://goo.gl/S2Hy2A)
  },
  palette: {
    popup: {
      background: '#212327'
    },
    button: {
      background: '#EB8106'
    }
  },
  // theme: 'edgeless',
  type: 'opt-in',
  elements: {
    messagelink: `
    <span id="cookieconsent:desc" class="cc-message">{{message}} 
      <a aria-label="learn more about cookies" tabindex="0" class="cc-link" href="{{cookiePolicyHref}}" target="_blank">{{cookiePolicyLink}}</a>, 
      <a aria-label="learn more about our privacy policy" tabindex="1" class="cc-link" href="{{privacyPolicyHref}}" target="_blank">{{privacyPolicyLink}}</a> and our 
      <a aria-label="learn more about our terms of service" tabindex="2" class="cc-link" href="{{tosHref}}" target="_blank">{{tosLink}}</a>
    </span>
    `,
  },
  // overrideHTML: 'cc-allow',
  content: {
    message: 'We use cookies to improve your experience. By using our website you are accepting our ',

    cookiePolicyLink: 'Cookie Policy',
    cookiePolicyHref: `${environment.websiteURL}/cookie-policy`,

    privacyPolicyLink: 'Privacy Policy',
    privacyPolicyHref: `${environment.websiteURL}/privacy-policy`,

    tosLink: 'Terms and Conditions',
    tosHref: `${environment.websiteURL}/terms-and-conditions`,

    allow: 'OK',
    deny: null
  },
  autoOpen: (localStorage.getItem('acceptCookie')) ? false : true,
  revokable: true
};

export function TranslationLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

export function initLocale(translateService, cookie, httpClient,router) {
  return () => {
    return new Promise((resolve) => {
    httpClient.get(`${environment.websiteURL}${APIS.CURRENT_IP}`).toPromise().then((res)=>{
        let locale=COUNTRIES_LOCALES[res.country_code]?COUNTRIES_LOCALES[res.country_code]:DEFAULT_VALUES.LOCALE;

        translateService.setDefaultLang(locale);
        let result = RESTRICTED_COUNTRIES.find(function(e) {
          return e.country ==res?.country_code;
        })
        if(result){
          if(router.url.includes('forbidden')){
            // sharedService.restricted.next(true);
            resolve()
          } else{
            // sharedService.restricted.next(true);
            router.navigate(['/forbidden'])
            resolve()
          }
  
        } else {
        /** -- set url language as current locale */
        let urlLanguage = new URL(window.location.href).pathname.split('/')[1];
        translateService.use(urlLanguage).subscribe(suc => {
          resolve();
        }, err1 => {
          /** -- if error then set user language as current locale */
          let userLanguage = cookie.get(USER_DETAILS.Locale)?cookie.get(USER_DETAILS.Locale):locale;
          // let userLanguage=locale;
          translateService.use(userLanguage).subscribe(suc => {
            resolve();
          }, err2 => {
            /** -- if error then set browser language as current locale */
            let browserLanguage = translateService.getBrowserLang();
            translateService.use(browserLanguage).subscribe(suc => {
              resolve();
            }, err3 => {
              /** -- if error then set default language as current locale */
              translateService.use(locale);
              resolve();
            });
          });
        });
      }
      })

    });
  };
}
@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    GamesComponent,
    HowItWorkComponent,
    ProvidersComponent,
    GamesListComponent,
    CategoryGamesComponent,
    CasinoComponent,
    GamePlayComponent,
    SupportComponent,
    TournamentsComponent,
    CasinoTournamentComponent,
    TournamentBannerComponent,
    TournamentHeaderComponent,
    TournamentBottomComponent,
    TournamentCardComponent,
    StaticInfoPagesComponent,
    PromotionsComponent,
    PromotionsHeadComponent,
    PromotionsCardComponent,
    CurrentTournamentComponent,
    CasinoPromotionsComponent,
    PromotionsBottomComponent,
    FaqCardsComponent,
    NotfoundComponent,
    RegistrationProcedureComponent
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    NgcCookieConsentModule.forRoot(cookieConfig),
    SharedModule,
    AppRoutingModule,
    UsersModule,
    LivechatWidgetModule,
    NgSlimScrollModule,
    StrengthMeterModule,
    FormsModule,
    DynamicHTMLModule.forRoot({
      components: [
        { component: CasinoTournamentComponent, selector: 'casino-tournament' },
        { component: CasinoPromotionsComponent, selector: 'casino-promotions' }
      ]
    }),
    TranslateModule.forRoot({
      loader: { provide: TranslateLoader, useFactory: TranslationLoaderFactory, deps: [HttpClient] }
    }),
    BrowserAnimationsModule
  ],
  providers: [
    RealTimeService,
    HttpService,
    CookieService,
    BnNgIdleService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpRequestInterceptor,
      multi: true
    },
    { provide: APP_BASE_HREF, useValue: '/' },
    { provide: APP_INITIALIZER, useFactory: initLocale, deps: [TranslateService, CookieService, HttpClient,Router], multi: true },
    {
      provide: SLIMSCROLL_DEFAULTS,
      useValue: {
        alwaysVisible: true,
        // gridOpacity: '0.2',
        // barOpacity: '0.5',
        gridBackground: 'rgba(0, 0, 0, 0.2)',
        gridWidth: '4',
        gridMargin: '0 0 6px',
        allowPageScroll: true,
        barBackground: '#560985',
        barWidth: '3',
        wheelStep: 10,
        touchScrollStep: 75,
        // barMargin: '2px 2px'
      } as ISlimScrollOptions
    },
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent]
})
export class AppModule { }
