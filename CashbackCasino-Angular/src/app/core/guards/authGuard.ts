
import { AuthService, ModalService, HttpService, SharedService } from 'src/app/core/services';
import { Injectable } from '@angular/core';
import { APIS, FLAGS, RESTRICTED_COUNTRIES, ROUTING, USER_DETAILS } from './../../common/constants';
import { UpdatetermsComponent } from '../../modules/users/updateterms/updateterms.component';

import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  ActivatedRoute,
  Params
} from '@angular/router';
import { Observable } from 'rxjs';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { LoginComponent } from 'src/app/modules/auth/login/login.component';
import { DEFAULT_VALUES } from 'src/app/common/constants';
import { PayNPlayResolver } from '../services/pay-n-play.resolver';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {

  constructor(
    private authService: AuthService,
    private router: Router,
    private modalService: ModalService,
    private httpService:HttpService,
    private translate:TranslateService,
    private pnpService:PayNPlayResolver,
    private sharedService:SharedService
  ) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    if (this.authService.isAuthenticated()) {
      this.sharedService.isPNPLogin();
      if(state.url.includes('sign_in') || state.url.includes('sign_up')){
        this.router.navigateByUrl('/');
        return false;
      } else{
      return true;
      }
    }
    // this.httpService.getData(APIS.CURRENT_IP).subscribe((res) => {
    //   this.sharedService.currentIP.next(res.body)
    //   let pnpAllowed=(this.pnpService.isCountryAllowed(res?.body?.country_code) ? true : false);
    //   if(pnpAllowed) {
    //     this.router.navigate(['/',this.translate.currentLang || localStorage.get(USER_DETAILS.Locale)])
    //   } else {
        if(state.url.includes('sign_in') || state.url.includes('sign_up')){
          return true;
        } 
      // }
  // },(err)=>{
  //   this.router.navigateByUrl('/');
  //   this.modalService.openModal(LoginComponent,{redirectionRoute:state.url,route:next.params.url,data:state.url});
  // });
    this.router.navigateByUrl('/');
    return false;
  }

}

@Injectable({
  providedIn: 'root'
})
export class LangGuard {
  currentLang;
  btag;
  constructor(
    private router: Router,
    private translateService: TranslateService,
    private authService: AuthService
  ) { }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    this.currentLang = this.translateService.currentLang || DEFAULT_VALUES.LOCALE;

    let flagItems = FLAGS;
    let locale = flagItems.find(elem => {
      console.log(elem.link)
      return elem.link == this.translateService.currentLang;
    })
    if(!locale?.link){
      this.currentLang = 'en';
      window.location.href = `${environment.siteUrl}${this.currentLang}`; 
    }
    if(next.queryParams.btag || next.queryParams.ctag || next.queryParams.stag || next.queryParams.subid){
      this.authService.getAffiliatesTag(next.queryParams)
    }
    if (next.params.lang) {
      if (next.params.lang != this.currentLang && !parseInt(next.params.lang))
        this.router.navigateByUrl(`/${this.currentLang}${state.url}`);
    }
    else if (state.url != "/") {
      if (state.url.split('/').map((e, i) => e == this.currentLang ? i : 0).filter(Boolean).toString().includes("1,2,3")) {
        /** -- if url is not exist */
        this.router.navigateByUrl(`/${this.currentLang}`);
      }
      else {
        this.router.navigateByUrl(`/${this.currentLang}${state.url}`);
      }
    }
    else {
      this.router.navigateByUrl(`/${this.currentLang}`);
    }
    return true;
  }
}

@Injectable({
  providedIn: 'root'
})
export class termsCheckGuard {

  constructor(
    private modalService: ModalService,
    private httpService: HttpService
  ) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {

    this.httpService.getData(APIS.PLAYER.DATA).subscribe((resp) => {
      if (resp.body?.auth_fields_missed?.length > 0) {
      //   for (var i = 0; i < resp.body?.auth_fields_missed?.length; i++) {
      //     if (resp.body?.auth_fields_missed[i] == "terms_acceptance") {
      //       console.log("resp.body.auth_fields_missed.", resp.body?.auth_fields_missed)
      //       this.modalService.openModal(UpdatetermsComponent);
      //       // termsUpdateFlag = 1;
      //       return false;
      //     }
      //     // else {
      //     //   if (this.playerData.auth_fields_missed.length - 1 == i && termsUpdateFlag == 0) {
      //     //     this.modalService.openModal(UpdatetermsComponent);
      //     //   }
      //     // }
      //   }
      this.modalService.openModal(UpdatetermsComponent,{playerData:resp.body,step:0});
      }
      // else if(resp?.body?.email && !resp.body?.mobile_phone){
      //   console.log('Auth Guard')
      //   this.modalService.openModal(UpdatetermsComponent,{step:2})
      // }

    })

    // if (this.authService.isAuthenticated()) {
    return true;
  }


}

@Injectable({
  providedIn: 'root'
})
export class PromoGuard {
  currentLang;
  btag;
  constructor(
    private router: Router,
    private translateService: TranslateService,
    private authService:AuthService
  ) { }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    this.currentLang = this.translateService.currentLang || DEFAULT_VALUES.LOCALE;
    if(Object.keys(next.queryParams).length>0){
      // let obj;
      // Object.keys(next.queryParams).forEach( (key)=> {
      //   obj[key]=next.queryParams[key]
      // })
      this.authService.getAffiliatesTag(next.queryParams)
    }
    let url=state.url;
    if (this.currentLang=='de' && url==ROUTING.USER.DE_PROMO) {
      return true;
    } else if(this.currentLang=='en' && url==ROUTING.USER.EN_PROMO){
      return true;
    }
    else if(this.currentLang=='fr' && url==ROUTING.USER.FR_PROMO){
      return true;
    }
    else if(this.currentLang=='en-CA' && url==ROUTING.USER.CA_PROMO){
      return true;
    }
    else if(this.currentLang=='fi' && url==ROUTING.USER.FI_PROMO){
      return true;
    }
    else if(this.currentLang=='no' && url==ROUTING.USER.NO_PROMO){
      return true;
    }
    else if(this.currentLang=='en-NZ' && url==ROUTING.USER.NZ_PROMO){
      return true;
    }
    else if(this.currentLang=='de' && url==ROUTING.USER.DE_PROMO_150){
      return true;
    }
    else if(this.currentLang=='en-NZ' && url==ROUTING.USER.NZ_PROMO_150){
      return true;
    }
    else if(this.currentLang=='no' && url==ROUTING.USER.NO_PROMO_150){
      return true;
    }
    else if(this.currentLang=='en' && url==ROUTING.USER.EN_PROMO_150){
      return true;
    }
    else if(this.currentLang=='fr' && url==ROUTING.USER.FR_PROMO_150){
      return true;
    }
    else if(this.currentLang=='fi' && url==ROUTING.USER.FI_PROMO_150){
      return true;
    }
    else if(this.currentLang=='en-CA' && url==ROUTING.USER.CA_PROMO_150){
      return true;
    }
    else if(this.currentLang=='en' && (url==ROUTING.USER.EN_EN || url.includes(ROUTING.USER.EN_EN))){
      if(url!==ROUTING.USER.EN_EN){
        this.router.navigate([`/${ROUTING.USER.EN_EN}`])
      }
      return true;
    }

    this.router.navigate(['/'])
    return false;
  }
}


@Injectable({
  providedIn: 'root'
})
export class RestrictedCountriesGuard {

  constructor(
    private httpService: HttpService,
    private router: Router,
    private sharedService:SharedService
  ) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    if(this.sharedService.currentIP.value){
      let res=this.sharedService.currentIP.value;
      let result = RESTRICTED_COUNTRIES.find(function(e) {
        return e.country ==res?.country_code;
      })
      if(result){
          // this.sharedService.restricted.next(true);
          return true;

      } else {
          // this.sharedService.restricted.next(false);
          this.router.navigate(['/']);
          return false;
        
      }
    }else{
    this.httpService.getData(APIS.CURRENT_IP).subscribe((res) => {
      // if(res){
      // let res=this.sharedService.currentIP.value;
      if(res){
      let result = RESTRICTED_COUNTRIES.find(function(e) {
        return e.country ==res?.body.country_code;
      })
      if(result){
          return true;

      } else {
          this.router.navigate(['/']);
          return false;
        
      }
    }
    // return true;
    // }
  },(err)=>{
    this.router.navigate(['/'])
    return false;
  });
  return true;
}
  }

}
