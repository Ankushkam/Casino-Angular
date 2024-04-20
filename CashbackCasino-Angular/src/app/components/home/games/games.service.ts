import { BehaviorSubject } from 'rxjs';
import { IGameProvider, IGamesCollection } from './../../../core/interfaces/games';
import { Injectable } from '@angular/core';
import { RealTimeService } from 'src/app/core/services';
import { NotificationService } from 'src/app/core/services/notification.service';

@Injectable({
  providedIn: 'root'
})
export class GamesService {
  allGames: any;
  providers: IGameProvider[];
  collections: IGamesCollection[];
  isPlayForFun = new BehaviorSubject(false);
  isSearchGameClicked=new BehaviorSubject('');
  clearSearch = new BehaviorSubject(false);

  updateList = new BehaviorSubject(null);
  constructor(private realTimeService: RealTimeService, private notificationService: NotificationService) { }

  /**
   * Function solrt the @allKeys array based on the @sortKey exist inside @games.collections
   * @param games 
   * @param keys 
   * @param sortKey 
   */
  getFilteredGames(games: any, keys: string[], sortKey: string) {
    return keys.filter(key => (games[key]['collections'][sortKey] || games[key]['collections'][sortKey]==0))
      .sort((key1, key2) => {
        return (games[key1]['collections'][sortKey] - games[key2]['collections'][sortKey])
      })
  }


  getGamesOfProvider(games: any, keys: string[], provider: IGameProvider) {
    return keys.filter(key => provider.id == games[key].provider);
  }

  updateGamesList() {
    this.updateList.next(true);
  }

  isCollectionExists(collections, id) {
    return collections.find((collection) => {
      return collection.id == id;
    });
  }


  playForFun(value) {
    this.isPlayForFun.next(value);
  }

  subscribeRealTimeWinners() {
    this.realTimeService.subscribe('public:wins', (resp) => {
      if (resp.data)
        this.notificationService.latestWinner("winner", resp.data);
    });
  }

  subscribeRealTimeGameLimits() {
    this.realTimeService.subscribe('game_limits#', (resp) => {
      if (resp.data)
        this.notificationService.gameLimits("games", resp.data);
    })
  }

  initSubscriptions() {
    this.subscribeRealTimeGameLimits();
    this.subscribeRealTimeWinners();
  }

  clearSearchBox(status) {
    this.clearSearch.next(status);
  }

  clickSearchedGame(value) {
    this.isSearchGameClicked.next(value);
  }

}
