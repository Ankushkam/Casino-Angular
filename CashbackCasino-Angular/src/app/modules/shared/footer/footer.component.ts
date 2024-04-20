import { Component, OnInit } from '@angular/core';
import { SharedService } from 'src/app/core/services';
import { Subscription } from 'rxjs';
declare var apg_9f72ae3d_fc57_43b9_8de5_7c8203c392b5;

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  subscriptions: Array<Subscription> = [];
  footerContent: string = "";
  constructor(private sharedService: SharedService) { }
  ngOnInit(): void {
    try{
      setTimeout(()=>{
        apg_9f72ae3d_fc57_43b9_8de5_7c8203c392b5.init();
      },0)
    }catch(er){
      console.log("Error=======>>>",er)
    }
    this.subscriptions[0] = this.sharedService.snippets.subscribe(res=>{
      this.footerContent = res.find(snippet => snippet.id == "footer-content")?.content || "";
    });
  }
  ngOnDestroy() {
    this.subscriptions.forEach(sub =>{
        sub.unsubscribe();
    });
  }
}