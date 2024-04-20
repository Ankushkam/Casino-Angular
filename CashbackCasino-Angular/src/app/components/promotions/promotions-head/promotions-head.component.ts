import { Component, OnInit, Input} from '@angular/core';
import { AuthService, ModalService, SharedService } from 'src/app/core/services';
import { LoginComponent } from 'src/app/modules/auth/login/login.component';
import { DepositsComponent } from 'src/app/modules/users/payments/deposits/deposits.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RegisterComponent } from 'src/app/modules/auth/register/register.component';
import { PayNPlayModalComponent } from 'src/app/modules/shared/pay-n-play-modal/pay-n-play-modal.component';
import { MODALS } from 'src/app/common/constants';
import { SignupComponent } from 'src/app/modules/auth/signup/signup.component';

@Component({
  selector: 'app-promotions-head',
  templateUrl: './promotions-head.component.html',
  styleUrls: ['./promotions-head.component.scss'],
})
export class PromotionsHeadComponent implements OnInit {

  @Input() params;
  @Input() link;
  isPNPAllowed: boolean;
  isLoginUser: boolean;
  content;
  constructor(private modalService:ModalService, private ngModal:NgbModal, private sharedService:SharedService,private authService:AuthService) { }

  ngOnInit(): void {
    this.params=JSON.parse(this.params);
    this.getData();

  }

  getItNow() {
    if(this.link==MODALS.LOGIN) {
      if(this.isPNPAllowed) {
        let modalRef=this.ngModal.open(PayNPlayModalComponent, {
          size: 'md',
          keyboard: false,
          windowClass: 'pnp-modal',
          centered: true
        });
        modalRef.componentInstance.type=MODALS.SIGNUP;
      } else {
      this.modalService.openModal(SignupComponent);
      }
    } 
    else if(this.link=='deposit') {
      this.ngModal.open(DepositsComponent, {
        size: 'lg',
        keyboard: false,
        windowClass: 'modal-active'
      });
    }
  }

  getData() {
    this.sharedService.pnpAlowed.subscribe(res=>{
      this.isPNPAllowed=res;
    });
    this.sharedService.snippets.subscribe(res=>{
      if(res) {
      let data=JSON.parse(res.find(snippet => snippet.id == "home-banner")?.content);
      this.content=data;
    }
    });
    this.authService.authentication.subscribe((res: boolean) => {
      this.isLoginUser = !!res;
    });
  }

}
