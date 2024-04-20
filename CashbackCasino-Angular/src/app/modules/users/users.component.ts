import { Component, OnInit } from '@angular/core';
import { HttpService } from 'src/app/core/services';
import { APIS } from 'src/app/common/constants';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {

  navigationItems;
  constructor(
  ) { }

  ngOnInit(): void {
  }

}
