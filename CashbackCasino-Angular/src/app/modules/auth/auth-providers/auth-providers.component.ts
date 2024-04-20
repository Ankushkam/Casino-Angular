import { Component, OnInit } from '@angular/core';
import { HttpService } from 'src/app/core/services/http.service';
import { APIS } from 'src/app/common/constants';
@Component({
  selector: 'app-auth-providers',
  templateUrl: './auth-providers.component.html',
  styleUrls: ['./auth-providers.component.scss']
})
export class AuthProvidersComponent implements OnInit {

  allAuthProviders = [];
  constructor(
    private httpService: HttpService
  ) {

  }

  ngOnInit(): void {
    this.httpService.getData(APIS.ALL_AUTH_PROVIDERS_LIST).subscribe((res) => {
      this.allAuthProviders = res.body;
    });
  }

  getPath(path) {
    return `https://s5.casino.softswiss.com${path}`;
  }
}
