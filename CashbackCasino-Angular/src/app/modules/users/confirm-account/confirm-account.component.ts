import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService, ModalService } from 'src/app/core/services';
import { ConfirmationEmailComponent } from '../../auth/confirmation-email/confirmation-email.component';

@Component({
  selector: 'app-confirm-account',
  templateUrl:'./confirm-account.component.html',
  styleUrls: ['./confirm-account.component.scss']
})
export class ConfirmAccountComponent implements OnInit {
  token: String;
  constructor(
    private route: ActivatedRoute,
    private modalService: ModalService,
    private authService: AuthService,
    ) { }
    
    ngOnInit(): void {
      this.route.queryParams.subscribe(params => {
        this.token = params['confirmation_token'];
        this.confirmAccount();
      });
    }
    
    confirmAccount(){
      this.authService.confirmAccount({token:this.token}).subscribe( resp =>{
        this.modalService.openModal(ConfirmationEmailComponent, { step: 5});
      }, err =>{
        console.log(err);
        this.modalService.openModal(ConfirmationEmailComponent, { step: 4});
      });
    }

}
