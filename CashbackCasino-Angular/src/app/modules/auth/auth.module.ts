import { Routes, RouterModule } from '@angular/router';
import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { RegisterComponent } from './register/register.component';
import { SharedModule } from '../shared/shared.module';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { TwoFactorAuthComponent } from './two-factor-auth/two-factor-auth.component';
import { AuthProvidersComponent } from './auth-providers/auth-providers.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './login/login.component';
import { NgxCaptchaModule } from 'ngx-captcha';
import { ConfirmationEmailComponent } from './confirmation-email/confirmation-email.component';
import { UnlockEmailComponent } from './unlock-email/unlock-email.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { UsersModule } from '../users/users.module';
import { DepositBonusesComponent } from '../users/bonuses/deposit-bonuses/deposit-bonuses.component';
import { LoginMobileComponent } from './login-mobile/login-mobile.component';
import { StrengthMeterModule } from "ngx-strength-meter";
import { GooglePlaceModule } from "ngx-google-places-autocomplete";
import { SignupComponent } from './signup/signup.component';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { FilterPipe } from 'src/app/core/pipes/filterItems.pipe';
import { HighlightDirective } from 'src/app/core/directives/highlight.directive';
import { QRCodeModule } from 'angularx-qrcode';

// import { PayNPlayComponent } from './pay-n-play/pay-n-play/pay-n-play.component';

const route: Routes = [
  { path: '', redirectTo: 'register', pathMatch: 'full' },
  { path: 'register', component: RegisterComponent },
  // { path: 'pay-n-play',
  //  resolve:{data:PayNPlayResolver},
  //  children:[
  //   {path:'signin',component:PayNPlayComponent},
  //   {path:'signup', component:PayNPlayComponent}
  // ]},
  { path: 'send-confirmation-email', component: ConfirmationEmailComponent },
  { path: 'send-unlock-email', component: UnlockEmailComponent },
  { path: 'two-factor-auth', component: TwoFactorAuthComponent }
]

@NgModule({
  declarations: [
    RegisterComponent,
    ForgotPasswordComponent,
    AuthProvidersComponent,
    TwoFactorAuthComponent,
    LoginComponent,
    ConfirmationEmailComponent,
    UnlockEmailComponent,
    ResetPasswordComponent,
    LoginMobileComponent,
    SignupComponent,
    FilterPipe,
    HighlightDirective
    // PayNPlayComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(route),
    SharedModule,
    NgxCaptchaModule,
    UsersModule,
    StrengthMeterModule,
    GooglePlaceModule,
    NgxIntlTelInputModule,
    QRCodeModule
  ],
  schemas: [NO_ERRORS_SCHEMA],
  entryComponents: [DepositBonusesComponent, LoginComponent]
})
export class AuthModule { }
