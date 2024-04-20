import { Component, OnInit, Input } from '@angular/core';
import { AuthService } from 'src/app/core/services';
import { PROMOTIONS, MODALS } from 'src/app/common/constants';

@Component({
  selector: 'casino-promotions',
  templateUrl: './casino-promotions.component.html',
  styleUrls: ['./casino-promotions.component.scss']
})
export class CasinoPromotionsComponent implements OnInit {

  @Input() params;
  @Input() template;
  TEMPLATE_TYPES=PROMOTIONS.TEMPLATE_TYPE
  cardsLink;
  headLink
  constructor(private authService:AuthService) { }

  ngOnInit(): void {
    this.authService.authentication.subscribe((res)=>{
      if(res) {
        this.cardsLink=MODALS.DEPOSIT;
        this.headLink=MODALS.DEPOSIT;
      } else {
        this.headLink=this.cardsLink=MODALS.LOGIN;
      }
    })
  }

}
