import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { interval } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss'],
  encapsulation:ViewEncapsulation.None
})
export class TimerComponent implements OnInit {

  @Input() date;
  @Input() type;
  diff;
  subscription;
  minutes;
  seconds;
  days;
  hours;
  constructor() { }

  ngOnInit(): void {
    if (this.type == 'bonus') {
      this.date=new Date(this.date);
      this.subscription = interval(1000).pipe(map((x) => {
        this.diff = Math.floor((this.date.getTime() - new Date().getTime()));
      })).subscribe((x) => {
        this.days= Math.floor((Math.floor(this.diff/1000)) / 86400);
        this.hours = Math.floor(Math.floor(this.diff / 3.6e6));
        this.minutes = Math.floor((this.diff % 3.6e6) / 6e4)
      });
    }
    else {
      this.subscription = interval(1000).pipe(map((x) => {
        this.diff = Math.floor((new Date().getTime()) - this.date.getTime());
      })).subscribe((x) => {
        this.seconds = Math.floor((this.diff % 6e4) / 1000); //in s
        this.minutes = Math.floor((this.diff % 3.6e6) / 6e4);
      });
    }
  }

  getDays(t) {
    let days;
    days = Math.floor(t / 86400);
    return days;
  }
}

