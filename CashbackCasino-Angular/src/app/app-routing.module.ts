import { GamePlayService } from './core/services/game-play.service';
import { AuthGuard, LangGuard, PromoGuard, RestrictedCountriesGuard, termsCheckGuard } from 'src/app/core/guards/authGuard';
import { HowItWorkComponent } from './components/how-it-work/how-it-work.component';
import { CasinoComponent } from './components/casino/casino.component';
import { CategoryGamesComponent } from './components/category-games/category-games.component';
import { Category, Sub_Category } from './core/interfaces/games';
import { HomeService } from './core/services/home.service';
import { HomeComponent } from './components/home/home.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PaymentsComponent } from './modules/users/payments/payments/payments.component';
import { PaymentMethodsComponent } from './modules/users/payments/payment-methods/payment-methods.component';
import { ConfirmLinkComponent } from './modules/shared/confirm-link/confirm-link.component';
import { GamePlayComponent } from './components/game-play/game-play.component';
import { ModalRoutingComponent } from './modules/shared/modal-routing/modal-routing.component';
import { TournamentsComponent } from './components/tournaments/tournaments.component';
import { LoyaltyComponent } from './modules/users/loyalty/loyalty.component';
import { StaticInfoPagesComponent } from './components';
import { PromotionsComponent } from './components/promotions/promotions.component';
import { NotfoundComponent } from './notfound/notfound.component';
import { RegistrationProcedureComponent } from './registration-procedure/registration-procedure.component';
import { PNPtestComponent } from './modules/shared/pnptest/pnptest.component';
import { RestrictedCountriesComponent } from './modules/shared/restricted-countries/restricted-countries.component';

const routes: Routes = [
  { path: '', canActivate: [LangGuard], component: HomeComponent, resolve: { data: HomeService } },
  {path:'forbidden',component:RestrictedCountriesComponent, canActivate:[RestrictedCountriesGuard]},
  { path:  'de-promo', data:{promoImg:'assets/img/promotion_title/promotion_text_de-100_500.png'},canActivate:[PromoGuard],component: HomeComponent, resolve: { data: HomeService } },
  { path:  'en-promo', data:{promoImg:'assets/img/promotion_title/promotion_text_EN_500_100.png'},canActivate:[PromoGuard],component: HomeComponent, resolve: { data: HomeService } },
  { path:  'nz-promo', data:{promoImg:'assets/img/promotion_title/promotion_text_de-de.png'},canActivate:[PromoGuard],component: HomeComponent, resolve: { data: HomeService } },
  { path:  'no-promo', data:{promoImg:'assets/img/promotion_title/promotion_text_NRW-100.png'},canActivate:[PromoGuard],component: HomeComponent, resolve: { data: HomeService } },
  { path:  'ca-promo', data:{promoImg:'assets/img/promotion_title/promotion_text_EN_750_100.png'},canActivate:[PromoGuard],component: HomeComponent, resolve: { data: HomeService } },
  { path:  'fi-promo', data:{promoImg:'assets/img/promotion_title/promotion_text_fin100.png'},canActivate:[PromoGuard],component: HomeComponent, resolve: { data: HomeService } },
  { path:  'fr-promo', data:{promoImg:'assets/img/promotion_title/promotion_text_de-de.png'},canActivate:[PromoGuard],component: HomeComponent, resolve: { data: HomeService } },
  { path:  'en-promo150', data:{promoImg:'assets/img/promotion_title/promotion_text_EN_500_150.png'},canActivate:[PromoGuard],component: HomeComponent, resolve: { data: HomeService } },
  { path:  'de-promo150', data:{promoImg:'assets/img/promotion_title/promotion_text_de-150_500.png'},canActivate:[PromoGuard],component: HomeComponent, resolve: { data: HomeService } },
  { path:  'nz-promo150', data:{promoImg:'assets/img/promotion_title/promotion_text_de-de.png'},canActivate:[PromoGuard],component: HomeComponent, resolve: { data: HomeService } },
  { path:  'no-promo150', data:{promoImg:'assets/img/promotion_title/promotion_text_NRW-150.png'},canActivate:[PromoGuard],component: HomeComponent, resolve: { data: HomeService } },
  { path:  'ca-promo150', data:{promoImg:'assets/img/promotion_title/promotion_text_EN_750_150.png'},canActivate:[PromoGuard],component: HomeComponent, resolve: { data: HomeService } },
  { path:  'fi-promo150', data:{promoImg:'assets/img/promotion_title/promotion_text_fi150.png'},canActivate:[PromoGuard],component: HomeComponent, resolve: { data: HomeService } },
  { path:  'fr-promo150', data:{promoImg:'assets/img/promotion_title/promotion_text_de-de.png'},canActivate:[PromoGuard],component: HomeComponent, resolve: { data: HomeService } },
  // { path: '?btag=:btag', component: HomeComponent, resolve: { data: HomeService } },
  { path: 'payandplaytest', component:PNPtestComponent,resolve: { data: HomeService } , canActivate: [termsCheckGuard] },
  {
    path: ':lang', canActivate: [LangGuard], children: [
      // { path: '', redirectTo: 'home', pathMatch: 'full' },
      // Static Pages
      { path: '', component: HomeComponent, resolve: { data: HomeService }, canActivate: [termsCheckGuard] },
      { path: 'about-us', component: StaticInfoPagesComponent },
      { path: 'responsible-gaming', component: StaticInfoPagesComponent },
      { path: 'game-rules', component: StaticInfoPagesComponent },
      { path: 'privacy-policy', component: StaticInfoPagesComponent },
      { path: 'complaints', component: StaticInfoPagesComponent },
      { path: 'registration-procedure', component: StaticInfoPagesComponent },
      { path: 'terms-and-conditions', component: StaticInfoPagesComponent },
      { path: 'cashback-terms', component: StaticInfoPagesComponent },
      { path: 'promotions/cashback-terms', component: StaticInfoPagesComponent },
      { path: 'bonus-terms-conditions', component: StaticInfoPagesComponent },
      { path: 'cookie-policy', component: StaticInfoPagesComponent },
      { path: 'promotions/welcomeoffers-terms', component: StaticInfoPagesComponent },
      { path: 'payment-methods', component: PaymentMethodsComponent },
      { path: 'promotions', component: PromotionsComponent },
      { path: 'not-found', component: NotfoundComponent },
      { path: 'registation-procedure', component: RegistrationProcedureComponent },
      

      // { path: 'auth', loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule) },
      // { path: 'users', loadChildren: () => import('./modules/users/users.module').then(m => m.UsersModule) },
      { path: 'how-it-work', component: HowItWorkComponent, resolve: { data: HomeService } },

      // Games Routes
      { path: 'games', component: CategoryGamesComponent, data: { title: 'page_titles.our_games', category: Category.ALL }, resolve: { data: HomeService }, canActivate: [termsCheckGuard] },
      { path: 'play-games/:url', component: GamePlayComponent, canActivate: [AuthGuard], resolve: { data: GamePlayService } },
      { path: 'play-games-for-fun/:url', component: GamePlayComponent, data: { type: 'FUN' }, resolve: { data: GamePlayService } },
      { path: 'new-games', component: CategoryGamesComponent, data: { title: 'page_titles.new_games', category: Category.NEW }, resolve: { data: HomeService }, canActivate: [termsCheckGuard] },
      { path: 'popular-games', component: CategoryGamesComponent, data: { title: 'page_titles.popular_games', category: Category.POPULAR }, resolve: { data: HomeService }, canActivate: [termsCheckGuard] },
      { path: 'games/providers/:id', component: CasinoComponent, data: { title: "page_titles.casino", category: Category.ALL }, resolve: { data: HomeService }, canActivate: [termsCheckGuard] },
      { path: 'casino', component: CasinoComponent, data: { title: "page_titles.casino", category: Category.ALL }, resolve: { data: HomeService }, canActivate: [termsCheckGuard] },
      { path: 'live-casino', component: CategoryGamesComponent, data: { title: 'page_titles.live_casino', category: Category.LIVE_CASINO }, resolve: { data: HomeService }, canActivate: [termsCheckGuard] },
      { path: 'live-casino/popular', component: CategoryGamesComponent, data: { title: 'page_titles.live_casino', category: Category.LIVE_CASINO,tab:Sub_Category.LIVE_POPULAR }, resolve: { data: HomeService }, canActivate: [termsCheckGuard] },
      { path: 'live-casino/roulette', component: CategoryGamesComponent, data: { title: 'page_titles.live_casino', category: Category.LIVE_CASINO ,tab:Sub_Category.ROULLETE}, resolve: { data: HomeService }, canActivate: [termsCheckGuard] },
      { path: 'live-casino/blackjack', component: CategoryGamesComponent, data: { title: 'page_titles.live_casino', category: Category.LIVE_CASINO ,tab:Sub_Category.BLACKJACK}, resolve: { data: HomeService }, canActivate: [termsCheckGuard] },
      { path: 'live-casino/baccarat', component: CategoryGamesComponent, data: { title: 'page_titles.live_casino', category: Category.LIVE_CASINO,tab:Sub_Category.BACCARAT }, resolve: { data: HomeService }, canActivate: [termsCheckGuard] },
      { path: 'live-casino/poker', component: CategoryGamesComponent, data: { title: 'page_titles.live_casino', category: Category.LIVE_CASINO,tab:Sub_Category.POKER}, resolve: { data: HomeService }, canActivate: [termsCheckGuard] },
      { path: 'live-casino/card-games', component: CategoryGamesComponent, data: { title: 'page_titles.live_casino', category: Category.LIVE_CASINO,tab:Sub_Category.CARD_GAMES}, resolve: { data: HomeService }, canActivate: [termsCheckGuard] },
      { path: 'jackpot', component: CategoryGamesComponent, data: { title: "page_titles.jackpots", category: Category.JACKPOT }, resolve: { data: HomeService }, canActivate: [termsCheckGuard] },
      { path: 'megaways', component: CategoryGamesComponent, data: { title: "page_titles.megaways", category: Category.MEGAWAYS }, resolve: { data: HomeService }, canActivate: [termsCheckGuard] },
      { path: 'epic-wins', component: CategoryGamesComponent, data: { title: 'page_titles.epic_wins_over*10.000', category: Category.EPIC_WINS }, resolve: { data: HomeService }, canActivate: [termsCheckGuard] },
      { path: 'fruit-machines', component: CategoryGamesComponent, data: { title: 'page_titles.classic_fruit_machines', category: Category.CLASSIC_FRUIT_MACHINES }, resolve: { data: HomeService }, canActivate: [termsCheckGuard] },
      { path: 'cluster-plays', component: CategoryGamesComponent, data: { title: 'page_titles.cluster_plays', category: Category.CLUSTER_PLAYS }, resolve: { data: HomeService }, canActivate: [termsCheckGuard] },
      { path: 'win-both-ways', component: CategoryGamesComponent, data: { title: 'page_titles.win_both_ways', category: Category.WIN_BOTH_WAYS }, resolve: { data: HomeService }, canActivate: [termsCheckGuard] },
      { path: 'bonus-buys', component: CategoryGamesComponent, data: { title: 'page_titles.bonus_hunt', category: Category.BONUS_BUYS }, resolve: { data: HomeService }, canActivate: [termsCheckGuard] },
      { path: 'loyalty-program', component: LoyaltyComponent },

      // Modules
      { path: 'auth', loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule) },
      { path: 'users', loadChildren: () => import('./modules/users/users.module').then(m => m.UsersModule) },
      {
        path: 'payment', children: [
          { path: 'success', component: PaymentsComponent, data: { status: 'success' } },
          { path: 'pending', component: PaymentsComponent, data: { status: 'pending' } },
          { path: 'failure', component: PaymentsComponent, data: { status: 'failure' } }
        ]
      },
      // {
      //   path: 'tournaments', children: [
      //     { path: '', component: TournamentsComponent },
      //     { path: ':id', component: TournamentsComponent, resolve: { data: HomeService }}
      //   ]
      // },
      { path: 'documents', component: ModalRoutingComponent},
      {
        path: 'profile', children: [
          { path: 'info', component: ModalRoutingComponent },
          { path: 'edit', component: ModalRoutingComponent },
          { path: 'limits', component: ModalRoutingComponent },
          { path: 'deposit_limits', component: ModalRoutingComponent },
          { path: 'limits/confirm', component: ConfirmLinkComponent },
        ]
      },
      {
        path: 'accounts', children: [
          { path: 'history', component: ModalRoutingComponent }
        ]
      }
    ]
  },
  { path: '**', canActivate: [LangGuard], component: HomeComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
