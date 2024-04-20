import { DocumentService } from './../../core/services/user.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { EmailConfirmationHandlerComponent } from '../shared/components/email-confirmation-handler/email-confirmation-handler.component';
import { UsersComponent } from './users.component';
import { SharedModule } from '../shared/shared.module';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { UnlockAccountComponent } from './unlock-account/unlock-account.component';
import { ConfirmAccountComponent } from './confirm-account/confirm-account.component';
import { PaymentsComponent } from './payments/payments/payments.component';
import { PaymentMethodsComponent } from './payments/payment-methods/payment-methods.component';
import { DepositsComponent } from './payments/deposits/deposits.component';
import { MyProfileComponent } from './my-profile/my-profile.component';
import { ModalRoutingComponent } from '../shared/modal-routing/modal-routing.component';
import { AuthGuard } from 'src/app/core/guards/authGuard';
import { CategoryGamesComponent } from 'src/app/components/category-games/category-games.component';
import { HomeService } from 'src/app/core/services/home.service';
import { DocumentsComponent } from './documents/documents.component';
import { BonusesModalComponent } from './bonuses/bonuses-modal/bonuses-modal.component';
import { WithdrawComponent } from './payments/withdraw/withdraw.component';
import { DepositBonusesComponent } from './bonuses/deposit-bonuses/deposit-bonuses.component';
import { LoyaltyComponent } from './loyalty/loyalty.component';
import { WalletComponent } from './wallet/wallet.component';
import { WalletdepositComponent } from './wallet/walletdeposit/walletdeposit.component';
import { WalletwithdrawComponent } from './wallet/walletwithdraw/walletwithdraw.component';
import { AddBalanceWalletComponent } from './bonuses/add-balance-wallet/add-balance-wallet.component';
import { UpdatetermsComponent } from './updateterms/updateterms.component';
import { StrengthMeterModule } from "ngx-strength-meter";
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { QRCodeModule } from 'angularx-qrcode';
const route: Routes = [
  {
    path: '',
    component: UsersComponent
  },
  {
    path: 'confirmation',
    component: EmailConfirmationHandlerComponent
  },
  { path: 'password/edit', component: ResetPasswordComponent },
  { path: 'unlock', component: UnlockAccountComponent },
  { path: 'confirmation', component: UnlockAccountComponent },
  { path: 'freespin/:id', canActivate: [AuthGuard], component: CategoryGamesComponent, resolve: { data: HomeService } },
  { path: 'bonus/:id', canActivate: [AuthGuard], component: CategoryGamesComponent, resolve: { data: HomeService } },
  { path: 'sign_in', component: ModalRoutingComponent, canActivate: [AuthGuard] },
  { path: 'sign_up', component: ModalRoutingComponent, canActivate: [AuthGuard] },
  { path: 'password/new', component: ModalRoutingComponent, canActivate: [AuthGuard] },
  { path: 'documents', component: DocumentsComponent },
  // { path: 'confirmation/new', component: ModalRoutingComponent, canActivate: [AuthGuard] },
  // { path: 'unlock/new', component: ModalRoutingComponent, canActivate: [AuthGuard] },

]


@NgModule({
  declarations: [
    UsersComponent,
    ResetPasswordComponent,
    UnlockAccountComponent,
    ConfirmAccountComponent,
    PaymentsComponent,
    PaymentMethodsComponent,
    DepositsComponent,
    MyProfileComponent,
    BonusesModalComponent,
    DocumentsComponent,
    DepositBonusesComponent,
    WithdrawComponent,
    LoyaltyComponent,
    WalletComponent,
    WalletdepositComponent,
    WalletwithdrawComponent,
    AddBalanceWalletComponent,
    UpdatetermsComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(route),
    FormsModule,
    ReactiveFormsModule,
    StrengthMeterModule,
    NgxIntlTelInputModule,
    QRCodeModule
  ],

  exports: [
    DepositsComponent,
    DepositBonusesComponent,
    BonusesModalComponent
  ],
  providers: [NgbActiveModal, DocumentService]
})
export class UsersModule { }
