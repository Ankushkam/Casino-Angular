import { UserService } from './user.service';
import { BehaviorSubject } from 'rxjs';
import { Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { USER_DETAILS, APIS, ROUTING } from 'src/app/common/constants';
import { HttpService } from './http.service'
import { CookieService } from 'ngx-cookie-service';
import { ChangePassword, Email, Login, ResetPassword } from '../interfaces';
import { RealTimeService } from './real-time.service';
import { SharedService } from './shared.service';


@Injectable({
    providedIn: 'root'
})
export class AuthService {
    UserDetails = { ...USER_DETAILS };
    authentication = new BehaviorSubject(null);

    constructor(
        private router: Router,
        private httpService: HttpService,
        private cookieService: CookieService,
        private userService: UserService,
        private realTimeService: RealTimeService,
        private injector: Injector,
    ) {
        this.isAuthenticated()
    }

    isAuthenticated(): boolean {
        if (this.cookieService.get(this.UserDetails.OriginalUserId) || this.cookieService.get(this.UserDetails.IsLoggedIn) == 'true') {
            this.authentication.next(true);
            return true;
        }
        return false;
    }

    /** Get locally saved data from cookies*/
    getUserData(key) {
        return this.cookieService.get(key);
    }

    setUserData(key, value) {
        this.cookieService.delete(key);
        this.cookieService.set(key, value);
    }

    /** Save User data locally after login */
    saveUserData(userData) {
        this.cookieService.deleteAll();
        this.userService.userName = `${userData.first_name} ${userData.last_name}`;
        this.userService.email = userData[this.UserDetails.Email];
        this.userService.country = userData[this.UserDetails.Country];
        this.cookieService.set(this.UserDetails.Currency, userData[this.UserDetails.Currency]);
        this.cookieService.set(this.UserDetails.Country, userData[this.UserDetails.Country])
        this.cookieService.set(this.UserDetails.FirstName, userData[this.UserDetails.FirstName] || '');
        this.cookieService.set(this.UserDetails.LastName, userData[this.UserDetails.LastName] || '');
        this.cookieService.set(this.UserDetails.Email, userData[this.UserDetails.Email]);
        this.cookieService.set(this.UserDetails.Locale, userData['language']);
        this.cookieService.set(this.UserDetails.IsLoggedIn, 'true');
        this.authentication.next(true);
    }

    updateUserDetails(player){
        this.cookieService.deleteAll();
        this.userService.userName = `${player.first_name} ${player.last_name}`;
        this.userService.email = player[this.UserDetails.Email];
        this.userService.country = player[this.UserDetails.Country];
        this.cookieService.set(this.UserDetails.Currency, player[this.UserDetails.Currency]);
        this.cookieService.set(this.UserDetails.Country, player[this.UserDetails.Country])
        this.cookieService.set(this.UserDetails.FirstName, player[this.UserDetails.FirstName] || '');
        this.cookieService.set(this.UserDetails.LastName, player[this.UserDetails.LastName] || '');
        this.cookieService.set(this.UserDetails.Email, player[this.UserDetails.Email]);
        this.cookieService.set(this.UserDetails.Locale, player['language']);
        this.cookieService.set(this.UserDetails.IsLoggedIn, 'true');
        // this.authentication.next(true);
    }

    initAuthUser() {
        if (this.isAuthenticated()) {
            let userData = this.cookieService.getAll();
            this.userService.userName = `${userData.first_name} ${userData.last_name}`;
            this.userService.email = userData[this.UserDetails.Email];
            this.authentication.next(true);
        } else {
            // this.authentication.next(false);
        }
        return true;
    }

    getAffiliatesTag(data) {
        this.httpService.getData(APIS.INFO.AFFILIATES, data).subscribe((res) => {
            // console.log(res);
            this.router.navigate(['/']);
        })
    }

    logout() {
        const sharedService=this.injector.get(SharedService)
        this.httpService.deleteData(APIS.SIGN_OUT).subscribe(res => {
            this.realTimeService.get_config();
            sharedService.setSnippetsData();
            sharedService.getDefaultLevel();
            this.cookieService.deleteAll();
            sessionStorage.clear();
            this.authentication.next(false);
            this.httpService.getData(APIS.CURRENT_IP).subscribe((res)=>{
                if(res?.body?.country_code=='SE' || res?.body?.country_code=='FI'){
                  sharedService.hideCashbackBonus(true);
                  sharedService.hideBonuses(true);
                  if(!this.router.url.includes('en-en')){
                  this.router.navigate(['/en-en'])
                  }
                }
                if( res?.body?.country_code=='FI'){
                   sharedService.hideCashbackBonus(false);
                }
              })
            this.router.navigateByUrl('/');
        })

    }

    subscribeRealtimeEvents() {
        this.realTimeService.subscribe('analytics#', (resp) => {
            console.log("Real time channel user analytics", resp);
        });
    }

    autoLogin() {
        const data = {
            token: this.cookieService.get(USER_DETAILS.Token)
        }
        this.httpService.postData(APIS.AUTO_LOGIN, data).subscribe(res => {
            // TODO: Handle response
        })
    }

    login(payload: Login) {
        return this.httpService.postData(APIS.SIGN_IN, payload);
    }

    changePassword(payload: ChangePassword) {
        return this.httpService.putData(APIS.USER, payload);
    }

    forgotPassword(payload) {
        return this.httpService.postData(APIS.PASSWORD, payload);
    }
    /** -- function to resend confirmation email */
    sendConfirmationEmail(payload: Email) {
        return this.httpService.postData(APIS.EMAIL_CONFORMATION, payload);
    }
    /** -- function to resend unlock email */
    sendUnlockEmail(payload: Email) {
        return this.httpService.postData(APIS.UNLOCK_EMAIL, payload);
    }
    resetPassword(payload: ResetPassword) {
        return this.httpService.putData(APIS.PASSWORD, payload);
    }
    unlockAccount(payload: any) {
        return this.httpService.getData(`${APIS.UNLOCK_EMAIL}?unlock_token=${payload.token}`);
    }
    confirmAccount(payload: any) {
        return this.httpService.getData(`${APIS.UNLOCK_EMAIL}?confirmation_token=${payload.token}`);

    }
    getPath() {
        let parts: Array<string> = /\/(.+)\/(.+)/.exec(this.router.url);
        return `/${parts[2]}`;
        // return this.router.url.substring(3);
    }

    updatePlayer(payload) {
        return this.httpService.postData(APIS.PLAYER.UPDATE_PLAYER, payload);
    }
}