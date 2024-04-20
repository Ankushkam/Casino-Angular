import { LoaderService } from './../../../core/services/loader.service';
import { Component, OnInit, ChangeDetectorRef, NgZone, AfterViewChecked, AfterContentInit } from '@angular/core';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent implements OnInit,AfterContentInit {

  show: boolean;
  constructor(private loaderService: LoaderService,private _changeDetectionRef:ChangeDetectorRef) {
  }
  ngOnInit() {
    this.loaderService.isLoading.subscribe((value) => {
      setTimeout(() => {
        this.show = value;
      }, 0);
    });

  }

ngAfterContentInit () : void {
  // your code
  this._changeDetectionRef.detectChanges();
}

}
