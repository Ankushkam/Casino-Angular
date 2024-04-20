import { Router } from '@angular/router';
import { HttpService } from 'src/app/core/services';
import { IGameProvider } from './../../../core/interfaces/games';
import { Component, OnInit, Input } from '@angular/core';
import { APIS } from 'src/app/common/constants';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-providers',
  templateUrl: './providers.component.html',
  styleUrls: ['./providers.component.scss']
})
export class ProvidersComponent implements OnInit {
  @Input() providers: IGameProvider[];

  constructor(
    private httpService: HttpService,
    private router: Router
  ) { }

  ngOnInit(): void {

  }

  getProviders() {
    // this.httpService.getData(APIS.GAMES.PROVIDERS).subscribe()
  }

  ngAfterViewInit(): void {
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.

  }

  getLogoImg(provider: IGameProvider, imageType: string) {
    return `${environment.imgBaseURL}/logos/providers/${imageType}/${provider.id}.svg`;
  }

  selectProvider(id = '', title = '') {
    this.router.navigate(['/games/providers', id])
  }

}
