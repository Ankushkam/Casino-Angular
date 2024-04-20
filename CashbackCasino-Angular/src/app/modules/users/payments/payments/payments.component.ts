import { Component, OnInit } from '@angular/core';
import { HttpService, AuthService } from 'src/app/core/services';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { DepositsComponent } from '../deposits/deposits.component';
import { PAYMENT_FAILURE, PAYMENT_PENDING, PAYMENT_SUCCESS } from 'src/app/core/mocks/payment_Status';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.scss']
})
export class PaymentsComponent implements OnInit {

  url;
  status;
  constructor(
    private authService: AuthService,
    private router: Router,
    private httpService:HttpService,
    private ngModal: NgbModal,
  ) { }

  ngOnInit(): void {
    this.url= this.authService.getPath();
    if(this.url=='/payment/success' ||this.url=='/success') {
      this.status=PAYMENT_SUCCESS;
      this.addGtagScript();

    }
    else if(this.url=='/payment/pending' ||this.url=='/pending') {
      this.status=PAYMENT_PENDING;
    }
    else if(this.url=='/payment/failure'||this.url=='/failure' ) {
      this.status=PAYMENT_FAILURE;
    }
    this.httpService.getData('/api/player/payments').subscribe((res)=>{
      // this.status=res.body;
    })
    this.router.navigate(['/home']);
    this.openDeposits();
  }
  openDeposits() {
   
  //   let depositsModal=this.ngModal.open(DepositsComponent, {
  //     size: 'lg',
  //     keyboard: false,
  //     windowClass: 'modal-active'
  //   });
  // depositsModal.componentInstance.statusData=this.status;
  this.router.navigate(['/accounts/history'])
    
  }

  addGtagScript() {
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + environment.gtagKey;
    document.head.prepend(script);
  }
}
