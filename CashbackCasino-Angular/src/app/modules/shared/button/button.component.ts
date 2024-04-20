import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html'
})
export class ButtonComponent implements OnInit {
  @Input() btnText: string;
  @Input() src: string;
  @Input() type: string;
  @Output() onBtnClick = new EventEmitter<any>();
  constructor() { }

  ngOnInit(): void {
  }

  onClick() {
    this.onBtnClick.emit(true);
  }
  close(){
    this.onBtnClick.emit();
  }
}
