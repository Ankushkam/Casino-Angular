import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { interval } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-countdown',
  templateUrl: './countdown.component.html',
  styleUrls: ['./countdown.component.scss']
})

export class CountdownComponent implements OnInit,OnDestroy {

  @Input() endDate;
  @Input() type;
  @Input() status;
  statusText;

  diff: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  subscription;

  constructor(private translate:TranslateService) {
    // this.endDate=new Date(2020, 6, 10);
  }

  ngOnInit() {
    if(this.status=='upcoming') {
      this.statusText=this.translate.instant('text.start_in');
    } else if(this.status=='going') {
      this.statusText=this.translate.instant('text.end_in');;
    }
    this.subscription=interval(1000).pipe(map((x) => {
      this.diff = Math.floor((this.endDate.getTime() - new Date().getTime()) / 1000);
  })).subscribe((x) => {           
      this.days = this.getDays(this.diff);
      this.hours = this.getHours(this.diff);
      this.minutes = this.getMinutes(this.diff);
      this.seconds = this.getSeconds(this.diff);
  });
  }

  getDays(t){
      let days;
      days = Math.floor(t / 86400);
      return days;
  }

  getHours(t){
      let days, hours;
      days = Math.floor(t / 86400);
      t -= days * 86400;
      hours = Math.floor(t / 3600) % 24;
      return hours;
  }

  getMinutes(t){
      let days, hours, minutes;
      days = Math.floor(t / 86400);
      t -= days * 86400;
      hours = Math.floor(t / 3600) % 24;
      t -= hours * 3600;
      minutes = Math.floor(t / 60) % 60;
      return minutes;
  }

  getSeconds(t){
      let days, hours, minutes, seconds;
      days = Math.floor(t / 86400);
      t -= days * 86400;
      hours = Math.floor(t / 3600) % 24;
      t -= hours * 3600;
      minutes = Math.floor(t / 60) % 60;
      t -= minutes * 60;
      seconds = t % 60;
      return seconds;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
