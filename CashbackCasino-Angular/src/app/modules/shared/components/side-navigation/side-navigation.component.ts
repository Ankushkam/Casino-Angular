import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-side-navigation',
  templateUrl: './side-navigation.component.html',
  styleUrls: ['./side-navigation.component.scss']
})
export class SideNavigationComponent implements OnInit {

  @Input() navigationItems;
  constructor() { }

  ngOnInit(): void {
    // console.log(this.navigationItems);
  }

}
