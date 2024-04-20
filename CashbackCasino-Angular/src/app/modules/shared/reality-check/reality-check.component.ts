import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { APIS } from 'src/app/common/constants';
import { AuthService, HttpService, SharedService } from 'src/app/core/services';
import * as _ from 'lodash';

@Component({
  selector: 'app-reality-check',
  templateUrl: './reality-check.component.html',
  styleUrls: ['./reality-check.component.scss']
})
export class RealityCheckComponent implements OnInit {

  realityCheckData;
  realityCheck;
  currency;
  allCurrencies=[];
  constructor(private activeModal: NgbActiveModal, private sharedService:SharedService,private httpService: HttpService, private authService: AuthService) { }

  ngOnInit(): void {
    // this.httpService.getData(APIS.CURRENCIES).subscribe((res)=>{
    //   this.allCurrencies=res?.body;
    //   this.realityCheckData = this.prepareData(this.realityCheck)
    // })
    this.sharedService.isCurrenciesUpdated.subscribe((res)=>{
      this.allCurrencies=this.sharedService.allCurrencies;
  })
    this.realityCheckData = this.prepareData(this.realityCheck)

    
  }

  prepareData(activity_data) {
    if (activity_data) {
      let data = {
        win: {},
        lost: {},
        wager_sum: activity_data.wager_sum,
        period: activity_data.period
      };


      data.period.time = (((new Date(activity_data.period.to)).getTime() - (new Date(activity_data.period.from)).getTime()) / 60000).toFixed(0);
      _.map(activity_data.activity_sum, function (value, key) {
        if (value <= 0) {
          data.lost[key] = value * -1;
          data.win[key]=0;
        }

        if (value >= 0) {
          data.win[key] = value;
          data.lost[key]=0
        }
      });

      // data=_.pickBy(data, val => ![null, undefined, '',{},_.isEmpty()].includes(val));
      return data;
    }
    return;
  }

  logout() {
    this.authService.logout();
    this.close();
  }

  close() {
    this.activeModal.close();
  }

}
