import { PLAYED_GAMES, MOBILE_GAMES } from './../../common/mock';
import { GamePlayService } from './../../core/services/game-play.service';
import { GamesService } from './../home/games/games.service';
import { USER_GAMES_TABS, IRecentGames } from './../../core/interfaces/games';
import { DomSanitizer } from '@angular/platform-browser';
import { AuthService, SharedService } from 'src/app/core/services';
import { HttpService } from './../../core/services/http.service';
import { environment } from './../../../environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { APIS, USER_DETAILS, GAMES_FILTER_KEYS, GAME_PLAY, DEFAULT_VALUES } from 'src/app/common/constants';
import { TranslateService } from '@ngx-translate/core';
import { HeaderService } from 'src/app/core/services/header.service';

@Component({
  selector: 'app-game-play',
  templateUrl: './game-play.component.html',
  styleUrls: ['./game-play.component.scss']
})
export class GamePlayComponent implements OnInit, OnDestroy {
  src: string;
  allGames: any;
  allKeys: string[];
  key: string;
  gameToPlay: any;
  type: string;
  isFavorite: boolean;
  favGamesIDs: number[];
  newGames = [];
  topGames = [];
  displayKeys: string[];
  userCurrency: string;
  recentGames: IRecentGames[];
  categories = [...USER_GAMES_TABS]
  title;
  currentCategory = USER_GAMES_TABS[0];
  showFrame: boolean;
  limit: number;
  startIndex = 0;
  ipad;
  isLoggedIn;
  gameUrl;
  currentLang;
  displayTabs = false;
  description;
  searchValue = "";
  today: number = Date.now();
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.ipad = (window.innerWidth <= DEFAULT_VALUES.IPAD_SIZE) ? true : false;
  }
  constructor(
    private activatedRoute: ActivatedRoute,
    private httpService: HttpService,
    private authService: AuthService,
    public sanitizer: DomSanitizer,
    private gameService: GamesService,
    private gamePlayService: GamePlayService,
    private translate: TranslateService,
    private sharedService: SharedService,
    private router: Router,
    private headerService:HeaderService,
    private translateService: TranslateService
  ) {

    setInterval(() => { this.today = Date.now() }, 1);
    this.activatedRoute.params.subscribe(res => {
      this.key = res.url;
      this.getContent();
    });
    this.activatedRoute.data.subscribe((res) => {
      this.type = res.type;
    })
  }

  ngOnInit(): void {
    this.gameService.isSearchGameClicked.subscribe((key)=>{
      if(key){
        this.key=key
        this.playGame(this.key)
      }
    })
    if (window.innerWidth <= DEFAULT_VALUES.IPAD_SIZE) this.ipad = true;
    this.searchValue = '';
    this.sharedService.hideSupportIcon(true);
    this.userCurrency = this.authService.getUserData(USER_DETAILS.Currency);
    this.currentLang = this.translateService.currentLang || DEFAULT_VALUES.LOCALE;
    this.isLoggedIn = this.authService.isAuthenticated();
    this.allGames = this.gameService.allGames;
    this.allKeys = Object.keys(this.allGames);
    this.limit = (window.innerWidth < 767) ? 4 : (window.innerWidth >= 767 && window.innerWidth < 1024) ? 6 : 8;
    // this.key = this.gamePlayService.key;
    this.playGame(this.key);
    if (this.isLoggedIn && window.innerWidth >= 767) {
      this.favGamesIDs = this.gamePlayService.favGamesIDs;
      this.recentGames = this.gamePlayService.recentGames;

      this.newGames = this.gameService.getFilteredGames(this.allGames, this.allKeys, this.getCountrySortKey(GAMES_FILTER_KEYS.NEW));
      this.topGames = this.gameService.getFilteredGames(this.allGames, this.allKeys, this.getCountrySortKey(GAMES_FILTER_KEYS.POPULARITY));
      // this.recentGames = (window.innerWidth < 767) ? MOBILE_GAMES : PLAYED_GAMES;
      this.filter(this.categories[0]);
    }
  }

  getCountrySortKey(sortKey) {
    return this.gameService.isCollectionExists(this.gameService.collections, `${sortKey}:${this.translate.currentLang}`) ? `${sortKey}:${this.translate.currentLang}` : sortKey;
  }


  filter(category: any) {
    if(this.displayTabs) {
    this.currentCategory = category
    let keys = [];
    switch (this.currentCategory.id) {
      case 'favGames':
        this.favGamesIDs.forEach(id => {
          let obj = this.allKeys.find(key => (this.allGames[key].real[this.userCurrency] || {}).id == id);
          if (obj) {
            keys.push(obj);
          }
        });
        this.displayKeys = keys;
        break;
      case 'recentGames':
        this.displayKeys = this.recentGames.map(obj => obj.identifier)
        break;
      case 'newGames':
        this.displayKeys = this.newGames;
        this.displayKeys = this.displayKeys.slice(0, GAME_PLAY.GAMES_LIMIT);
        break;
      case 'topGames':
        this.displayKeys = this.topGames;
        this.displayKeys = this.displayKeys.slice(0, GAME_PLAY.GAMES_LIMIT);
        break;
    }
  }
    // this.displayKeys = this.allKeys.slice(0, 15);
  }

  playGame(key: string) {
    this.gameToPlay = this.allGames[key];
    if (this.isLoggedIn) {
      this.isFavorite = this.isFavoriteGame();
    }
  }

  close() {
    this.headerService.fetchData();
    this.headerService.isUpdateAccount.next(true);
  }

  playSearchGame(key) {
    this.searchValue = "";
    this.router.navigate(['/play-games', key])
    this.playGame(key);
    this.displayKeys = [];
    return
  }

  onShowTab(event) {
    this.displayTabs = event;
  }


  isFavoriteGame() {
    if (!this.favGamesIDs) {
      return false;
    }
    return this.favGamesIDs.some(id => id == this.gameToPlay.real[this.userCurrency].id);
  }

  get url() {
    if (!this.gameToPlay) {
      return
    }
    if (this.type == 'FUN') {
      if(!this.gameToPlay.demo){
        this.gameToPlay = undefined;
      }
      return `${environment.gameBaseURL}/${this.gameToPlay.demo}`;
    } else {
      if (!Object.keys(this.gameToPlay.real).some(currency => currency == this.userCurrency)) {
        return;
      }
      return `${environment.gameBaseURL}/games/${this.key}/${this.gameToPlay.real[this.userCurrency].id}`;
    }
  }

  fullScreen() {
    let elem = document.getElementById('iframe');
    elem.requestFullscreen();
  }

  makeFavourite() {
    let currency = this.authService.getUserData(USER_DETAILS.Currency);
    let id = this.gameToPlay.real[currency].id;
    if (!this.isFavorite) {
      this.httpService.putData(`${APIS.GAMES.FAVORITE}/${id}`, {}).subscribe(res => {
        this.isFavorite = true;
        this.getFavGames();
      }, err => {

      })
    } else {
      this.httpService.deleteData(`${APIS.GAMES.FAVORITE}/${id}`).subscribe(res => {
        this.isFavorite = false;
        this.getFavGames();
      }, err => {

      })
    }
  }

  getFavGames() {
    this.httpService.getData(APIS.GAMES.FAVORITE).subscribe((res) => {
      this.favGamesIDs = res.body;
      this.filter(this.categories[0]);
    })
  }

  onClickCategory(category: any) {
    if (category.id == 'favGames') {

    }
  }

  getImageURL(identifier: string) {
    return `${environment.imgBaseURL}/i/s3/${identifier}.png`;
  }

  ngOnDestroy() {
    this.sharedService.hideSupportIcon(false);
  }

  getContent(){
    this.httpService.getData(`/api/games/meta_titles/${this.key}`).subscribe((res)=>{
      // console.log(res)
      this.title=res?.body[this.currentLang];
    });
    this.httpService.getData(`/api/games/descriptions/${this.key}`).subscribe((res)=>{
      // console.log(res,this.currentLang)
      this.description=res?.body[this.currentLang];
      // console.log(this.description);
    });
    // this.httpService.getData(`/api/games/meta_title/${this.key}`).subscribe((res)=>{
    //   console.log(res)
    //   this.title=res[this.currentLang];
    // })
  }
}
