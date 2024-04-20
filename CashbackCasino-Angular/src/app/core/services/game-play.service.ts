import { map, catchError, retry } from 'rxjs/operators';
import { forkJoin, throwError } from 'rxjs';
import { HttpService } from './http.service';
import { GamesService } from './../../components/home/games/games.service';
import { Resolve} from '@angular/router';
import { Injectable } from '@angular/core';
import { APIS } from 'src/app/common/constants';
import { IRecentGames } from '../interfaces/games';
import { AuthService } from './auth.service';
import { RestrictionsService } from './restrictions.service';

@Injectable({
  providedIn: 'root'
})
export class GamePlayService implements Resolve<any> {
  favGamesIDs: number[];
  recentGames: IRecentGames[];
  loggedIn;
  key: string;
  constructor(
    private gameService: GamesService,
    private httpService: HttpService,
    private authService:AuthService,
    private restrictionService:RestrictionsService
  ) { }

  resolve(
    route: import("@angular/router").ActivatedRouteSnapshot,
    state: import("@angular/router").RouterStateSnapshot
  ) {
    this.loggedIn=this.authService.isAuthenticated();
    const apiCalls = [];
    if(this.loggedIn){
    apiCalls.push(this.httpService.getData(APIS.GAMES.FAVORITE));
    apiCalls.push(this.httpService.getData(APIS.GAMES.RECENT_GAMES));
    }
    // if (!this.favGamesIDs || !this.recentGames) {
    // }
    if (!this.gameService.allGames) {
      let gameAPI = (window.innerWidth <= 767) ? APIS.GAMES.MOBILE_ALLOWED : APIS.GAMES.DESKTOP_ALLOWED;
      apiCalls.push(this.httpService.getData(gameAPI));
    }

    if (apiCalls.length > 0) {
      return forkJoin(apiCalls).pipe(
        map((res: any) => {
          if (this.loggedIn) {
            this.favGamesIDs = res[0].body;
            this.recentGames = res[1].body;

            if (!this.gameService.allGames) {
              this.gameService.allGames = this.restrictionService.restrictGames(res[2].body);
            }
          } else {
            if (!this.gameService.allGames) {
              this.gameService.allGames = this.restrictionService.restrictGames(res[0].body);
            }

          }
          // if ((!this.favGamesIDs || !this.recentGames) && !this.gameService.allGames) {
          // } else if (!this.gameService.allGames) {
          //   this.gameService.allGames = res[0].body;
          // }
          // if (!this.favGamesIDs || !this.recentGames) {
          // }

        }),
        catchError(err => {
          // this.cookieService.deleteAll()
          return throwError(err)
        }),
        retry(2)
      )
    }
  }

  getFavoriteGames() {
    this.httpService.getData(APIS.GAMES.FAVORITE).subscribe(res => {
      this.favGamesIDs = res.body;
    })
  }

  getGamesData() {
      let gameAPI = (window.innerWidth <= 767) ? APIS.GAMES.MOBILE_ALLOWED : APIS.GAMES.DESKTOP_ALLOWED;
  
      const apiCalls = [];
        apiCalls.push(this.httpService.getData(gameAPI));
        apiCalls.push(this.httpService.getData(APIS.GAMES.PROVIDERS));
        apiCalls.push(this.httpService.getData(APIS.GAMES.COLLECTIONS));
      if (apiCalls.length) {
        return forkJoin(apiCalls).subscribe((response: any) => {
              this.gameService.allGames = this.restrictionService.restrictGames(response[0].body);
                this.gameService.providers = this.restrictionService.restrictProviders(response[1].body);
                this.gameService.collections = response[2].body;
                this.gameService.updateGamesList();
  
          });
      }
  }
}
