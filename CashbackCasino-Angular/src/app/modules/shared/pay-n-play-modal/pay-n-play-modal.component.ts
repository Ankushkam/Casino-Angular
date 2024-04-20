import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { SharedService } from 'src/app/core/services';

@Component({
  selector: 'app-pay-n-play-modal',
  templateUrl: './pay-n-play-modal.component.html',
  styleUrls: ['./pay-n-play-modal.component.scss']
})
export class PayNPlayModalComponent implements OnInit {

  content;
  type;
  pnpType;
  hidePNPBox=true;
  currentIp;
  constructor(
    private sharedService:SharedService,
    private activeModal: NgbActiveModal,
    private translate:TranslateService
  ) { }

  ngOnInit(): void {
    this.getData();
  }

  getData() {
    this.currentIp=this.sharedService.currentIP.value;
    this.sharedService.snippets.subscribe(res=>{
      if(res) {
      let data=JSON.parse(res.find(snippet => snippet.id == "home-banner")?.content);
      if(this.currentIp?.country_code=='SE' && this.translate.currentLang=='en'){
        this.content=data['en-en'];
      } else{
      this.content=data['pnp'];
      }
    }
    });
  }

  close(event) {
    this.activeModal.close();
  }

}
