import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedService } from 'src/app/core/services';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-faq-cards',
  templateUrl: './faq-cards.component.html',
  styleUrls: ['./faq-cards.component.scss']
})
export class FaqCardsComponent implements OnInit, OnDestroy {

  faqCardsData;
  subscriptions: Array<Subscription> = [];
  constructor(private sharedService:SharedService) { }

  ngOnInit(): void {
    this.subscriptions[0] = this.sharedService.snippets.subscribe(res=>{
      this.faqCardsData=JSON.parse(res.find(snippet => snippet.id == "faq-cards-data")?.content) || {};
    });
  }
  ngOnDestroy() {
    this.subscriptions.forEach(sub =>{
        sub.unsubscribe();
    });
  }

}
