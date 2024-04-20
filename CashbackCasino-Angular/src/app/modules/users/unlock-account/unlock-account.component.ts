import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UnlockEmailComponent } from '../../auth/unlock-email/unlock-email.component';
import { AuthService, ModalService } from 'src/app/core/services';

@Component({
  selector: 'app-unlock-account',
  templateUrl: './unlock-account.component.html',
  styleUrls: ['./unlock-account.component.scss']
})
export class UnlockAccountComponent implements OnInit {
  token: String;
  constructor(
    private route: ActivatedRoute,
    private modalService: ModalService,
    private authService: AuthService,
    ) { }
    
    ngOnInit(): void {
      this.route.queryParams.subscribe(params => {
        this.token = params['unlock_token'];
        this.unlockAccount()
      });
    }
    
    unlockAccount(){
      this.authService.unlockAccount({token:this.token}).subscribe( resp =>{
        this.modalService.openModal(UnlockEmailComponent, { step: 5});
      }, err =>{
        this.modalService.openModal(UnlockEmailComponent, { step: 4});
      });
    }
    
  }
  