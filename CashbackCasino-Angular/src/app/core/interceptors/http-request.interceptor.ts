import { LoaderService } from './../services/loader.service';
import { AlertService } from './../services/alert.service';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse, HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { APIS } from 'src/app/common/constants';

@Injectable()
export class HttpRequestInterceptor implements HttpInterceptor {
    private requests: HttpRequest<any>[] = [];
    requestCount=0;
    isSessionOut:boolean;
    constructor(
        public router: Router,
        public authService: AuthService,
        public alertService: AlertService,
        private loaderService: LoaderService
    ) { }

    /** Request interceptor **/
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        let lastResponse: HttpEvent<any>;
        let error: HttpErrorResponse;
        // if (this.authService.isAuthenticated()) {
        //     const token = JSON.parse(this.authService.getUserData(USER_DETAILS.Token));
        //     req = req.clone({ headers: req.headers.set('authorization', token) });
        // }

        if(!req.url.includes(APIS.PLAYER.COMP_POINTS) && !req.url.includes(APIS.PLAYER.DATA) && !req.url.includes(APIS.STATUSES)){
        this.startRequest();
        }
        // this.loaderService.show();
        this.requests.push(req);

        return next.handle(req).pipe(
            tap((event: HttpEvent<any>) => {
                lastResponse = event;
                if (event instanceof HttpResponse) {
                    this.removeRequest(req);
                }
            }, (err: any) => {
                this.removeRequest(req);
                if (err instanceof HttpErrorResponse) {
                    error=err;
                    if (err.status === 0) {
                        this.alertService.error('<h6>Network error!</h6> <span>Please check your internet connection.</span>');
                    }
                    else if (err.status === 401) {
                        this.authService.logout();
                        if(!this.isSessionOut){
                        // localStorage.clear();
                        // we need to clear cookie here
                        
                        this.alertService.error('<h6>Your session has been expired.</h6> <span>Please login again</span>');
                        this.isSessionOut=true;
                        }
                    }
                }
            },
            // () => {
                // this.removeRequest(req);
            // }
            ),
            finalize(()=>{
                if (lastResponse.type === HttpEventType.Sent && !error) {
                    // last response type was 0, and we haven't received an error
                    this.removeRequest(req);
                    console.log('aborted request');
                  }
            })
            
        );
    }
    /** Remove request **/
    removeRequest(req: HttpRequest<any>) {
        // this.loaderService.hide();
        this.endRequest();
        const i = this.requests.indexOf(req);
        this.requests.splice(i, 1);
    }
    startRequest(): void {
        // If this is the first request,start the spinner
        if (this.requestCount == 0) {
            this.loaderService.show();
        }
        
        this.requestCount++;
    }

    endRequest(): void {
        // setTimeout(function() {
            if (this.requestCount == 0){
            return;
            }
    
            this.requestCount--;
    
            if (this.requestCount == 0) {
                this.loaderService.hide()
                this.isSessionOut=false;
            }
        // }, 1000);  
                 
    }
}