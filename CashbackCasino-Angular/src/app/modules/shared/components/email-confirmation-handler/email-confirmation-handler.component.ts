import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpService } from 'src/app/core/services/http.service';
import { APIS, USER_DETAILS } from 'src/app/common/constants';
import { AlertService, AuthService, ModalService, SharedService } from 'src/app/core/services';
import { MyProfileComponent } from 'src/app/modules/users/my-profile/my-profile.component';
import { CookieService } from 'ngx-cookie-service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-email-confirmation-handler',
  templateUrl: './email-confirmation-handler.component.html',
  styleUrls: ['./email-confirmation-handler.component.scss']
})
export class EmailConfirmationHandlerComponent implements OnInit {

  token;
  constructor(
    private route: ActivatedRoute,
    private httpService: HttpService,
    private router: Router,
    private alertService: AlertService,
    private modalService:ModalService,
    private cookieService:CookieService,
    private sharedService:SharedService,
    private authService:AuthService,
    private translate:TranslateService
  ) { }

  ngOnInit(): void {
    // Get query params from current route
    this.route.queryParamMap.subscribe((queryParams: any) => {
      this.token = queryParams?.params;
      this.confirmToken(this.token);
    });
  }

  /**
   * Send token to backend for confirmation
   * @param token 
   */
  confirmToken(token) {
    this.httpService.getData(APIS.EMAIL_CONFORMATION, this.token).subscribe((res) => {
      this.alertService.success(this.translate.instant('messages.account_confirmed'));
      this.isUserLoggedIn();
    }, err => {
      this.alertService.error(this.translate.instant('messages.confirmation_link_expired'));
      this.router.navigate(['/']);
    });
  }

  isUserLoggedIn() {
    if(!this.sharedService.playerData.value || !this.sharedService.playerData.value.locale) {
        this.httpService.getData(APIS.PLAYER.DATA).subscribe((res) => {
          if(res.body.id){
            this.sharedService.playerData.next((res || {}).body);
            this.cookieService.set(USER_DETAILS.IsLoggedIn,'true')
            this.authService.setUserData(USER_DETAILS.Locale, this.translate.currentLang);
            this.authService.authentication.next(true);
            this.router.navigate(['/']);
            this.modalService.openModal(MyProfileComponent, { goToLimits: true });
          }
        })
    } else {
         this.cookieService.set(USER_DETAILS.IsLoggedIn,'true')
         this.authService.setUserData(USER_DETAILS.Locale, this.translate.currentLang);
         this.authService.authentication.next(true);
         this.router.navigate(['/']);
         this.modalService.openModal(MyProfileComponent, { goToLimits: true });
    }

}
}
