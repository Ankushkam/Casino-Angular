import { Component, OnInit } from '@angular/core';
import { GamesService } from '../../home/games/games.service';
import { IGameProvider } from 'src/app/core/interfaces/games';
import { SharedService } from 'src/app/core/services';

@Component({
  selector: 'app-promotions-bottom',
  templateUrl: './promotions-bottom.component.html',
  styleUrls: ['./promotions-bottom.component.scss']
})
export class PromotionsBottomComponent implements OnInit {

  allGames;
  gameProviders: IGameProvider[];
  constructor(private gameService:GamesService,private sharedService:SharedService) { }

  ngOnInit(): void {
    this.gameService.updateList.subscribe(res => {
      if (res&& this.sharedService.currentIP.value.country_code!=='US') {
        this.gameProviders = this.gameService.providers;
        this.allGames = this.gameService.allGames;
      }
    });
  }

}
