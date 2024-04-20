import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RESTRICTED_COUNTRIES } from 'src/app/common/constants';
import { SharedService } from 'src/app/core/services';

@Component({
  selector: 'app-restricted-countries',
  templateUrl: './restricted-countries.component.html',
  styleUrls: ['./restricted-countries.component.scss']
})
export class RestrictedCountriesComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {

  }

}
