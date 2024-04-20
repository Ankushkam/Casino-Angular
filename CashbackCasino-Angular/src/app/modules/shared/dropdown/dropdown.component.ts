import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.component.html'
})
export class DropdownComponent implements OnInit {
  @Input() btnClass: string;
  @Input() iconClass: string;
  @Input() btnSrc: string;
  @Input() src: string;
  @Input() items;
  @Input() show: boolean;
  @Input() btnText: string;
  @Output() onClick = new EventEmitter();

  btnCss: any;
  iconCss: any;
  dropdownCss: any;
  dropDownMenu: any;

  constructor() { }

  ngOnInit(): void {
    // this.btnCss = {
    //   'dropdown-toggle btn-transparent': true
    // }
    // this.dropdownCss = {
    //   dropdown: true,
    // }
    if (this.show) {
      this.dropdownCss.show
    }
    // if (this.btnClass) {
    //   this.btnCss[this.btnClass] = true
    // }
    // if (this.iconClass) {
    //   this.iconCss[this.iconClass] = true;
    // }
  }

  onButtonClick() {
    this.onClick.emit(this.show);
  }


}
