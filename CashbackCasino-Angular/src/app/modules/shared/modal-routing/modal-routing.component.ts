import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginComponent } from '../../auth/login/login.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ROUTING } from 'src/app/common/constants';
import { RegisterComponent } from '../../auth/register/register.component';
import { ForgotPasswordComponent } from '../../auth/forgot-password/forgot-password.component';
import { MyProfileComponent } from '../../users/my-profile/my-profile.component';
import { SignupComponent } from '../../auth/signup/signup.component';

@Component({
    selector: 'modal-routing',
    template: '',
    styles: ['']
})
export class ModalRoutingComponent implements OnInit {

    constructor(
        private router: Router,
        private ngModal: NgbModal
    ) { }

    ngOnInit(): void {
        let url = this.router.url;
        let component: any;
        let data: any = {};
        if (url.includes(ROUTING.USER.LOGIN)) {
            // this.httpService.getData(APIS.CURRENT_IP).subscribe((res) => {
            //     currentIP.next(res.body);
            // });

            // console.log("currentIP modal routing: ", currentIP.country_code)
            // if (currentIP.country_code == 'FI' || currentIP.country_code == 'IN') {
            //     this.router.navigate(['/']);
            // }
            // else {
            //     component = LoginComponent;
            // }
            component = LoginComponent;

        }
        else if (url.includes(ROUTING.USER.SIGNUP)) {
            component = SignupComponent;
        }
        else if (url.includes(ROUTING.USER.FORGOT_PASSWORD)) {
            component = ForgotPasswordComponent;
        }
        else if (url.includes(ROUTING.USER.PROFILE) || url.includes(ROUTING.USER.PROFILE_EDIT) || url.includes(ROUTING.USER.DEPOSITS)|| url.includes(ROUTING.USER.DOCUMENTS) ||  url.includes(ROUTING.USER.HISTORY)) {
            component = MyProfileComponent;
            data.profileEdit = url.includes(ROUTING.USER.PROFILE_EDIT) || url.includes(ROUTING.USER.PROFILE);
            data.goToDeposits = url.includes(ROUTING.USER.DEPOSITS);
            data.goToDocuments = url.includes(ROUTING.USER.DOCUMENTS);
            data.goToHistory = url.includes(ROUTING.USER.HISTORY);
        }

        let modal = this.ngModal.open(component, {
            size: 'lg',
            centered: true,
            backdrop: 'static',
            keyboard: false,
        });
        if (Object.keys(data).length) {
            Object.keys(data).forEach(key => {
                modal.componentInstance[key] = data[key];
            });
        }
        this.router.navigate(['/']);
    }
}