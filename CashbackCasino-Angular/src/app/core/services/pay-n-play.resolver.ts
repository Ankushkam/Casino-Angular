import { forkJoin,BehaviorSubject } from 'rxjs';
import { HttpService } from './http.service';
import { Resolve} from '@angular/router';
import { Injectable } from '@angular/core';
import { APIS, PAY_N_PLAY_COUNTRIES } from 'src/app/common/constants';
import { ModalService } from './modal.service';
import { PayNPlayModalComponent } from 'src/app/modules/shared/pay-n-play-modal/pay-n-play-modal.component';

@Injectable({
  providedIn: 'root'
})
export class PayNPlayResolver implements Resolve<any> {

  currentIpInfo= new BehaviorSubject(null);
  constructor(
    private httpService: HttpService,
    private modalService:ModalService
  ) { }

  resolve(
    route: import("@angular/router").ActivatedRouteSnapshot,
    state: import("@angular/router").RouterStateSnapshot
  ) {
    const apiCalls = [];
    apiCalls.push(this.httpService.getData(APIS.PAY_N_PLAY.SETTINGS));
    apiCalls.push(this.httpService.getData(APIS.PAY_N_PLAY.URLS));
    apiCalls.push(this.httpService.getData(APIS.CURRENT_IP));
      return forkJoin(apiCalls)
  }

  isCountryAllowed(country) {
    return PAY_N_PLAY_COUNTRIES.find((item)=>{
      return item==country;
    })
  }

  PNPSignin(){
    this.httpService.getData(APIS.PAY_N_PLAY.URLS).subscribe((res)=>{
      this.httpService.getData(res?.body?.sign_in).subscribe((result)=>{
        this.modalService.openModal(PayNPlayModalComponent,{title:'Sign in',data:result.body});
      })
    })

  }

  PNPSignup(){
    this.httpService.getData(APIS.PAY_N_PLAY.URLS).subscribe((res)=>{
      this.httpService.getData(res?.body?.sign_up).subscribe((result)=>{
        this.modalService.openModal(PayNPlayModalComponent,{title:'Sign Up',data:result.body});
      })
    })
  }

}