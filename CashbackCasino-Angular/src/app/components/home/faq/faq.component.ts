import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { SharedService } from 'src/app/core/services';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss']
})
export class FaqComponent implements OnInit {
  subscriptions: Array<Subscription> = [];
  faq:any = []
  constructor(private sharedService: SharedService) { }

  ngOnInit(): void {
    this.subscriptions[0] = this.sharedService.snippets.subscribe(res=>{
      // console.log(res)
      this.faq = JSON.parse(res.find(snippet => snippet.id == "faq-data")?.content || "[]");
    });
  }
  ngAfterViewInit(): void {
    this.onSelect(0);
  }

  onSelect(id) {
    this.faq.forEach((obj, index) => {
      if (index == id) {
        let classList = document.getElementById('' + id).classList;
        if (classList.contains('collapsed')) {
          document.getElementById('' + id).classList.remove('collapsed')
          document.getElementById('faq' + id).classList.add('show')
        } else {
          document.getElementById('' + id).classList.add('collapsed')
          document.getElementById('faq' + id).classList.remove('show')
        }
      } else {
        document.getElementById('' + index).classList.add('collapsed')
        document.getElementById('faq' + index).classList.remove('show')
      }
    })
  }
  ngOnDestroy() {
    this.subscriptions.forEach(sub =>{
        sub.unsubscribe();
    });
  }
}