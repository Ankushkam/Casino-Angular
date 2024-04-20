import { CategoryListComponent } from './category-list/category-list.component';
// import { SupportComponent } from './support/support.component';
import { SafePipe } from './../../core/pipes/safe.pipe';
import { RouterModule } from '@angular/router';
import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { EmailConfirmationHandlerComponent } from './components/email-confirmation-handler/email-confirmation-handler.component';
import { SocialAuthHandlerComponent } from './components/social-auth-handler/social-auth-handler.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxCaptchaModule } from 'ngx-captcha';
import { SideNavigationComponent } from './components/side-navigation/side-navigation.component';

import { SlickCarouselModule } from 'ngx-slick-carousel';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { SidebarComponent } from './sidebar/sidebar.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { DividerComponent } from './divider/divider.component';
import { DropdownComponent } from './dropdown/dropdown.component';
import { FormErrorComponent } from './form-error/form-error.component';
import { ButtonComponent } from './button/button.component';
import { LoaderComponent } from './loader/loader.component';
import { AutofocusDirective } from 'src/app/core/directives/autofocus.directive';
import { CurrencySymbolPipe } from 'src/app/core/pipes/currencySymbol.pipe';
import { CloseModalComponent } from './close-modal/close-modal.component';
import { AccountLimitFormComponent } from './account-limit-form/account-limit-form.component';
import { SearchComponent } from './search/search.component';
import { ConfirmLinkComponent } from './confirm-link/confirm-link.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { WinnerComponent } from './winner/winner.component';
import { CurrencyConverterPipe } from 'src/app/core/pipes/currencyConverter.pipe';
import { ModalRoutingComponent } from './modal-routing/modal-routing.component';
import { GamesSliderComponent } from './games-slider/games-slider.component';
import { CountdownComponent } from './countdown/countdown.component';
import { FaqComponent } from 'src/app/components/home/faq/faq.component';
import { TranslateModule } from '@ngx-translate/core';
import { NotificationCentreComponent } from './notification-centre/notification-centre.component';
import { TimerComponent } from './timer/timer.component';
import { BonusOfDayComponent } from './bonus-of-day/bonus-of-day.component';
import { PayNPlayComponent } from './pay-n-play/pay-n-play.component';
import { PayNPlayModalComponent } from './pay-n-play-modal/pay-n-play-modal.component';
import { RealityCheckComponent } from './reality-check/reality-check.component';
import { StrengthMeterModule } from "ngx-strength-meter";
import { GameFooterComponent } from './game-footer/game-footer.component';
import { GameSearchComponent } from './game-search/game-search.component';
import { InfoPopupComponent } from './info-popup/info-popup.component';
import { IframeComponent } from './iframe/iframe.component';
import { DisableControlDirective } from 'src/app/core/directives/disable-control.directive';
import { PNPtestComponent } from './pnptest/pnptest.component';
import { RestrictedCountriesComponent } from './restricted-countries/restricted-countries.component';


@NgModule({
  declarations: [
    FaqComponent,
    SidebarComponent,
    HeaderComponent,
    FooterComponent,
    DividerComponent,
    DropdownComponent,
    EmailConfirmationHandlerComponent,
    SocialAuthHandlerComponent,
    SideNavigationComponent,
    FormErrorComponent,
    ButtonComponent,
    LoaderComponent,
    CurrencySymbolPipe,
    CurrencyConverterPipe,
    AutofocusDirective,
    CloseModalComponent,
    AccountLimitFormComponent,
    SearchComponent,
    ConfirmLinkComponent,
    ChangePasswordComponent,
    WinnerComponent,
    ModalRoutingComponent,
    SafePipe,
    GamesSliderComponent,
    CategoryListComponent,
    CountdownComponent,
    NotificationCentreComponent,
    TimerComponent,
    BonusOfDayComponent,
    PayNPlayComponent,
    PayNPlayModalComponent,
    RealityCheckComponent,
    GameFooterComponent,
    GameSearchComponent,
    InfoPopupComponent,
    IframeComponent,
    DisableControlDirective,
    PNPtestComponent,
    RestrictedCountriesComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgxCaptchaModule,
    SlickCarouselModule,
    NgbModule,
    RouterModule,
    TranslateModule,
    StrengthMeterModule
  ],
  providers: [CurrencyConverterPipe, CurrencySymbolPipe],
  exports: [
    FaqComponent,
    SidebarComponent,
    HeaderComponent,
    FooterComponent,
    DividerComponent,
    DropdownComponent,
    SlickCarouselModule,
    EmailConfirmationHandlerComponent,
    SocialAuthHandlerComponent,
    SideNavigationComponent,
    FormErrorComponent,
    CloseModalComponent,
    ButtonComponent,
    AccountLimitFormComponent,
    ConfirmLinkComponent,
    ChangePasswordComponent,
    ModalRoutingComponent,
    RouterModule,
    LoaderComponent,
    AutofocusDirective,
    NgbModule,
    TranslateModule,
    CurrencySymbolPipe,
    CurrencyConverterPipe,
    SearchComponent,
    WinnerComponent,
    SafePipe,
    GamesSliderComponent,
    CategoryListComponent,
    CountdownComponent,
    DatePipe,
    TimerComponent,
    BonusOfDayComponent,
    PayNPlayComponent,
    GameSearchComponent,
    InfoPopupComponent,
    IframeComponent,
    DisableControlDirective
    // SupportComponent
  ],
  schemas: [NO_ERRORS_SCHEMA]
})
export class SharedModule { }
