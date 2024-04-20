import { Injectable } from '@angular/core';
import { forkJoin, throwError } from 'rxjs';
import { HttpService } from './http.service';;
import { AuthService } from './auth.service';
import { catchError, retry, map } from 'rxjs/operators';
import { APIS } from 'src/app/common/constants';
@Injectable({
    providedIn: 'root'
  })
  export class BonusPreviewService {
    constructor(
        private httpService: HttpService,
        private authService: AuthService
      ) {
      }
    resolve(
        route: import("@angular/router").ActivatedRouteSnapshot,
        state: import("@angular/router").RouterStateSnapshot
      ) {
        let apiCalls = [];
        this.authService.authentication.subscribe(res=>{
            if(res) {
                apiCalls.push(this.httpService.getData(APIS.BONUS_PREVIEW.DEPOSIT_BONUSES));
                apiCalls.push(this.httpService.getData(APIS.BONUS_PREVIEW.REGISTRATION_BONUSES));
            } else {
                apiCalls.push(this.httpService.getData(APIS.BONUS_PREVIEW.REGISTRATION_BONUSES));
            }
        })
        
        if (apiCalls.length) {
    
          return forkJoin(apiCalls).pipe(
            map((response: any) => {
              return response;
            }),
            catchError(err => {
              return throwError(err)
            }),
            retry(2)
          );
        } else {
          return null;
        }
      }
  }