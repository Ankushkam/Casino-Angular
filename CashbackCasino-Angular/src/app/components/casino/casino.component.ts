import { GamesService } from './../home/games/games.service';
import { IGameProvider, Category } from './../../core/interfaces/games';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { SharedService } from 'src/app/core/services';

@Component({
  selector: 'app-casino',
  templateUrl: './casino.component.html',
  styleUrls: ['./casino.component.scss']
})
export class CasinoComponent implements OnInit, OnDestroy {
  gameProviders: IGameProvider[];
  allGames: any;
  title: string;
  provider: IGameProvider;
  subscription: Subscription[];
  constructor(
    private activatedRoute: ActivatedRoute,
    private gameService: GamesService,
    private translate:TranslateService,
    private sharedService:SharedService
  ) {

  }

  ngOnInit(): void {
    this.gameService.updateList.subscribe(res => {
      if (res&& this.sharedService.currentIP.value.country_code !== 'US') {
        this.gameProviders = this.gameService.providers;
        this.allGames = this.gameService.allGames;
      }else if (!res && this.gameService.providers && this.gameService.allGames) {
        this.gameService.updateGamesList();
      }
    })
    this.activatedRoute.data.subscribe(res => {
      this.title = this.translate.instant(res.title);
    })
    this.activatedRoute.params.subscribe((res: any) => {
      if (Object.keys(res).length && res.id) {
        this.provider = this.gameProviders.find(provider => provider.id == res.id);
        if (!this.provider) {
          this.provider = { id: res.id, title: res.id.toUpperCase() };
        }
      }
    });
    this.onLanguageChange();
  }

  onLanguageChange(){
    this.translate.onLangChange.subscribe(()=>{
      this.activatedRoute.data.subscribe(res => {
      this.title = this.translate.instant(res.title);
      });
    })
  }

  ngOnDestroy(): void {
    // this.subscription.forEach(subscriptin => subscriptin.unsubscribe());
  }
}
