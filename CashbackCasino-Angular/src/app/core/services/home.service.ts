import { HeaderService } from './header.service';
import { IWinner, WINNER_TYPE } from './../interfaces/winner';
import { USER_DETAILS, APIS } from './../../common/constants';
import { GamesService } from './../../components/home/games/games.service';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from './auth.service';
import { map, retry, catchError } from 'rxjs/operators';
import { forkJoin, throwError } from 'rxjs';
import { HttpService } from 'src/app/core/services';
import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { RestrictionsService } from './restrictions.service';

@Injectable({
  providedIn: 'root'
})
export class HomeService implements Resolve<any> {
  winnerList: IWinner[];
  topFiveWinners: IWinner[];

  constructor(
    private httpService: HttpService,
    private cookieService: CookieService,
    private gameService: GamesService,
    private authService: AuthService,
    private headerService: HeaderService,
    private restrictionService:RestrictionsService
  ) {
    this.callAPISAfterLogin = this.callAPISAfterLogin.bind(this)
  }

  resolve(
    route: import("@angular/router").ActivatedRouteSnapshot,
    state: import("@angular/router").RouterStateSnapshot
  ) {
    // Select games API based on Platform type i.e desktop or mobile
    let gameAPI = (window.innerWidth <= 767) ? APIS.GAMES.MOBILE_ALLOWED : APIS.GAMES.DESKTOP_ALLOWED;

    const apiCalls = [];
    const apiSequenceList = [];
    // if don't have games Add API to fetch the games
    if (!this.gameService.allGames) {
      apiCalls.push(this.httpService.getData(gameAPI));
      apiSequenceList.push(gameAPI);
    }
    // if don't have Games providers list Add API to fetch the Providers list
    if (!this.gameService.providers) {
      apiCalls.push(this.httpService.getData(APIS.GAMES.PROVIDERS));
      apiSequenceList.push(APIS.GAMES.PROVIDERS);
    }
    // IF Don't have latest winners List
    if (!this.winnerList) {
      apiCalls.push(this.httpService.getData(APIS.WINNERS))
      apiSequenceList.push(APIS.WINNERS);
    }
    // if don't have Games Collections list Add API to fetch the Providers list
    if (!this.gameService.collections) {
      apiCalls.push(this.httpService.getData(APIS.GAMES.COLLECTIONS));
      apiSequenceList.push(APIS.GAMES.COLLECTIONS);
    }
    if (this.restrictionService.allRestrictions.length==0) {
      apiCalls.push(this.httpService.getData(APIS.PLAYER.RESTRICTIONS));
      apiSequenceList.push(APIS.PLAYER.RESTRICTIONS);
      apiCalls.push(this.httpService.getData(APIS.PLAYER.RESTRICTION_MARKS));
      apiSequenceList.push(APIS.PLAYER.RESTRICTION_MARKS);
    }
    if (apiCalls.length) {

      return forkJoin(apiCalls).pipe(
        map((response: any) => {
          apiSequenceList.forEach((api, index) => {
            if (api == gameAPI) {
              this.gameService.allGames = this.restrictionService.restrictGames(response[0].body);
              // On getting games list, publish the games list by calling updateGamesList()
              this.gameService.updateGamesList();
              this.authService.authentication.subscribe(this.callAPISAfterLogin)
            }
            if (api == APIS.GAMES.PROVIDERS) {
              this.gameService.providers =this.restrictionService.restrictProviders(response[index].body);
            }
            if (api == APIS.GAMES.COLLECTIONS) {
              this.gameService.collections = response[index].body;
            }
            if (api == APIS.WINNERS) {
              this.winnerList = response[index].body;
              this.filterWinners();
            }
            if (api == APIS.PLAYER.RESTRICTIONS) {
              this.restrictionService.allRestrictions=response[index].body;
            }
            if (api == APIS.PLAYER.RESTRICTION_MARKS) {
              this.restrictionService.getRestrictions(response[index].body);
              this.gameService.allGames = this.restrictionService.restrictGames(response[0].body);
              this.gameService.providers =this.restrictionService.restrictProviders(this.gameService.providers);
              this.gameService.updateGamesList();
            }
          });

          // if (!this.gameService.providers && !this.gameService.allGames) {
          //   this.gameService.providers = response[1].body;
          //   if (!this.winnerList) {
          //     this.winnerList = response[2].body;
          //     this.filterWinners();
          //   } 
          // } else if (!this.gameService.providers) {
          //   this.gameService.providers = response[0].body;
          //   if (!this.winnerList) {
          //     this.winnerList = response[1].body;
          //     this.filterWinners();
          //   }
          // } else if (!this.winnerList) {
          //   this.winnerList = response[0].body;
          //   this.filterWinners();
          // }

          // if (!this.gameService.allGames) {
          //   this.gameService.allGames = response[0].body;
          //   // On getting games list, publish the games list by calling updateGamesList()
          //   this.gameService.updateGamesList();

          //   this.authService.authentication.subscribe(this.callAPISAfterLogin)
          // }

          return response;
        }),
        catchError(err => {
          this.cookieService.deleteAll()
          return throwError(err)
        }),
        retry(2)
      );
    } else {
      return null;
    }
  }

  /**
   * 
   */
  callAPISAfterLogin(res) {
    if (res) {
      this.getGames();
      // After login user filter the games based on user currency and publish the new games list
      this.filterGames(Object.keys(this.gameService.allGames), this.gameService.allGames);
      this.gameService.updateGamesList();
      this.filterWinners();
      // this.sharedService.setSnippetsData();

      // forkJoin([
      //   this.httpService.getData(APIS.PLAYER.DATA),
      //   this.httpService.getData(APIS.PLAYER.COMP_POINTS)
      // ]).subscribe(resp => {
      //   this.sharedService.checkLevelUpdate(resp[0].body.statuses.find(obj => obj.id.includes('level_')));
      //   this.sharedService.updateCurrentLevel({ points: resp[1].body.persistent?.points || 0 });
      // })
    } else if (res == false) {
      this.getGames();
      if (this.winnerList) {
        this.filterWinners();
      } else {
        this.getLatestWinners();
      }
    }
  }
  /**
   * Function to filter the games after login user
   * @param keys All the keys of allGames Object
   * @param allGames 
   */
  filterGames(keys: string[], allGames: any) {
    // Filter Games based on user currency
    let currency = this.authService.getUserData(USER_DETAILS.Currency);
    for (let index = 0; index < keys.length; index++) {
      if (!allGames[keys[index]].real[currency]) {
        delete allGames[keys[index]];
      }
    }
  }

  private filterWinners() {
    let currency = this.authService.getUserData(USER_DETAILS.Currency);
    // this.topFiveWinners = (currency) ? this.winnerList.filter(obj => obj.currency == currency).slice(0, 20) : this.winnerList?.slice(0, 20);

    this.topFiveWinners = (currency) ? this.winnerList?.filter(obj => obj.currency == currency) : this.winnerList;
    this.headerService.updateList();

    if (this.topFiveWinners?.length == 0) {
      this.topFiveWinners = this.winnerList;
    }
  }

  // Function to get the games
  getGames() {
    let gameAPI = (window.innerWidth <= 767) ? APIS.GAMES.MOBILE_ALLOWED : APIS.GAMES.DESKTOP_ALLOWED;
    this.httpService.getData(gameAPI).subscribe(res => {
      this.gameService.allGames = this.restrictionService.restrictGames(res.body);
      this.gameService.updateGamesList();
    })
  }

  // Function to get the latest winners
  getLatestWinners() {
    this.httpService.getData(APIS.WINNERS).subscribe(res => {
      this.winnerList = res.body;
      this.filterWinners();
      // this.headerService.updateList();
    })
  }
}
