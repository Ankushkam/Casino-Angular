import { Component, OnInit } from '@angular/core';
import { AlertService, HttpService } from 'src/app/core/services';
import { ActivatedRoute, Router } from '@angular/router';
import { APIS } from 'src/app/common/constants';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'confirm-link',
    template: ''
})
export class ConfirmLinkComponent implements OnInit {
    token: String;
    constructor(
        private route: ActivatedRoute,
        private httpService: HttpService,
        private alertService:AlertService,
        private router: Router,
        private translate:TranslateService
    ) { }
    
    ngOnInit(): void {
        this.route.queryParams.subscribe(params => {
            this.token = params['token'];
            this.confirm();
        });
    }
    
    confirm(){
        this.httpService.postData(APIS.USER_LIMIT_CONFIRM, { token: this.token }).subscribe( resp =>{
            this.alertService.success(this.translate.instant('messages.limit_confirmation'));
            this.router.navigate(['/']);
        }, err =>{
            this.alertService.error(this.translate.instant('messages.token_expired'));
            this.router.navigate(['/']);
        });
    }
}