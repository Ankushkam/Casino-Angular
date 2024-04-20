import { HostListener, Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DEFAULT_VALUES, MODALS } from 'src/app/common/constants';
import { LoginComponent } from 'src/app/modules/auth/login/login.component';
import { LoginMobileComponent } from 'src/app/modules/auth/login-mobile/login-mobile.component';

@Injectable({
    providedIn: 'root'
})
export class ModalService {
    signUp = new Subject();
    mobile: boolean = false;
    updateBalance= new BehaviorSubject(false);
    constructor(
        private ngModal: NgbModal
    ) { }

    
    openModal(componant:any,data?:any,size?:any) {
        if(componant==LoginComponent){
            this.mobile = (window.innerWidth <= DEFAULT_VALUES.MOBILE_SIZE) ? true : false;
            if(this.mobile){
            componant=LoginMobileComponent;
            }
        }
        let modal = this.ngModal.open(componant, {
            size: size?size:'lg',
            centered: true,
            backdrop: 'static',
            keyboard: false,
        })
        if(data){
            Object.keys(data).forEach(key =>{
                modal.componentInstance[key] = data[key];
            });
        }
        modal.result.then((res)=>{
            if(res=='update accounts') {
                this.updateBalance.next(true);
            }
        })
    }
}