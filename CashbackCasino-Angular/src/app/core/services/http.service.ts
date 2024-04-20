import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from "@angular/common/http";

import { throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AlertService } from './alert.service';
import { LoaderService } from './loader.service';
import { TranslateService } from '@ngx-translate/core';
import { APIS } from 'src/app/common/constants';


@Injectable({
    providedIn: 'root'
})
export class HttpService {
    headers = new HttpHeaders({
        'Accept': "application/vnd.softswiss.v1+json",
        'Content-Type': 'application/json',
    });
    private API_SERVER = environment.apiUrl;
    private WEBSITE_URL= environment.websiteURL;

    constructor(private httpClient: HttpClient,private translate:TranslateService, private alertService: AlertService,private loader:LoaderService) {
        this.handleError = this.handleError.bind(this)
    }

    handleError(error: HttpErrorResponse) {
        this.loader.hide();
        let errorMessage = this.translate.instant('forms.error.unknown_error');
        if (error.status === 0) {
            errorMessage = this.translate.instant('forms.error.network_error');
        }
        else if (error.error instanceof ErrorEvent) {
            // Client-side errors
            errorMessage = `${this.translate.instant('forms.label.error')} ${error.error.message}`;
        }
        else if (error.status == 422) {
            let err = error.error.errors;
            if (err) {
                errorMessage = `${Object.values(err[Object.keys(err)[0]])[0]}`;
            }
            else {
                errorMessage = error.error.message;
            }
        }
        else {
            // Server-side errors
            errorMessage = `${this.translate.instant('forms.label.error_code')} ${error.status}\nMessage: ${error.message}`;
        }
        // window.alert(errorMessage);
        return throwError(error.error ? error.error.errors : {});
        // return throwError(errorMessage);
    }

    public getData(apiPath: string, data?: any) {
        let url=this.API_SERVER;
        let headers;
        // if(!apiPath.includes('/api/cms')){
        headers = this.headers.append('Accept-Language', this.translate.currentLang);
        // }

        if(apiPath==APIS.PLAYER.SETTINGS || apiPath==APIS.CURRENT_IP) {
            url=this.WEBSITE_URL;
        }
        if(!apiPath.includes('/api/cms')){
        return this.httpClient.get(`${url}${apiPath}`, { params: data, headers: headers, withCredentials: true, observe: 'response' })
            .pipe(map((response: any) => {
                return response;
            }), catchError(this.handleError));
        } else {
            let header = new HttpHeaders({
                'Accept': "application/vnd.softswiss.v1+json",
                'Content-Type': 'application/json',
            });
            let currHeader=this.translate.currentLang=='en'?header:headers
            return this.httpClient.get(`${url}${apiPath}`, { params: data,headers:currHeader,  observe: 'response' })
            .pipe(map((response: any) => {
                return response;
            }), catchError(this.handleError));
        }
    }

    public postData(apiPath: string, data?: any) {
        let url=this.API_SERVER;
        if(apiPath==APIS.PAY_N_PLAY.SIGN_UP || apiPath==APIS.PAY_N_PLAY.SIGN_IN || apiPath==APIS.PAYMENTS.PAYMENT_PROCESSING) {
           url=this.API_SERVER;
        }
        return this.httpClient.post(`${url}${apiPath}`, data, { headers: this.headers, withCredentials: true }).pipe(catchError(this.handleError));
    }

    public patchData(apiPath: string, data?: any,params?:HttpParams) {
        return this.httpClient.patch(`${this.API_SERVER}${apiPath}`, data, { headers: this.headers,params:params, withCredentials: true }).pipe(catchError(this.handleError));
    }

    public putData(apiPath: string, data: any) {
        return this.httpClient.put(`${this.API_SERVER}${apiPath}`, data, { headers: this.headers, withCredentials: true }).pipe(catchError(this.handleError));;
    }

    public deleteData(apiPath: string) {
        return this.httpClient.delete(`${this.API_SERVER}${apiPath}`, { headers: this.headers, withCredentials: true })
            .pipe(catchError(this.handleError));
    }

    /**For External urls Redirection*/
    public post(url: string, data?: any) {
        return this.httpClient.post(url, data, { headers: new HttpHeaders({
            'Accept': "application/json;charset=utf-8",
            'Content-Type': 'application/json;charset=utf-8'
        }) });
    }

     /**For External urls Redirection*/
    public get(url: string, data?: any) {
        return this.httpClient.get(url, {params: data })
    }

    public postFormData(apiPath: string, data?: any) {
        return this.httpClient.post(`${this.API_SERVER}${apiPath}`, data,
            {
                headers: new HttpHeaders({
                    'Accept': 'multipart/form-data'
                }),
                withCredentials: true 
            });
    }
}