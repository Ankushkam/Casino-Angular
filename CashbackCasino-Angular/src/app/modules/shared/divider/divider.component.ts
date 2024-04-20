import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-divider',
  template: `<div class="divider my-4 clearfix"><img src="assets/img/icons/divider-lg.svg" alt="" /></div>`
})
export class DividerComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
