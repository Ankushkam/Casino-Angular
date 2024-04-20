import { GamesService } from './../home/games/games.service';
import { DEFAULT_VALUES, GAMES_FILTER_KEYS, APIS, OFFER_TYPES, GAMES_LIST } from './../../common/constants';
import { Category, IGameProvider, CATEGORY_TABS, SUB_CATEGORY_TABS } from './../../core/interfaces/games';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { HttpService, RealTimeService, SharedService } from 'src/app/core/services';
import * as _ from 'lodash';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-category-games',
  templateUrl: './category-games.component.html',
  styleUrls: ['./category-games.component.scss']
})
export class CategoryGamesComponent implements OnInit {

  categoryType: Category=Category.ALL;
  types=Category;
  categoryGames=GAMES_LIST.CATEGORY_GAMES;
  subcategoriesList=[...SUB_CATEGORY_TABS];
  categories = [...CATEGORY_TABS]
  title: string;
  gameProviders: IGameProvider[];
  allGames: any;
  games: any;
  allKeys: string[];
  displayKeys: string[];
  providerSpecificKeys: string[];
  endIndex: number;
  limit: number;
  sortKey: string;
  currentProvider: IGameProvider;
  new: boolean;
  live: boolean;
  tab;
  constructor(
    private activatedRoute: ActivatedRoute,
    private gameService: GamesService,
    private router: Router,
    private realTimeService: RealTimeService,
    private httpService: HttpService,
    private titleService:Title,
    private translate:TranslateService,
    private sharedService:SharedService
  ){
    this.getScrollHeight = this.getScrollHeight.bind(this)
  }

  ngOnInit(): void {
    let screen=document.body;
    screen.scrollTop=0;
    this.gameService.updateList.subscribe(res => {
      if (res&& this.sharedService.currentIP.value.country_code !== 'US') {
        let arr=this.gameService.providers;
        arr.sort(function(a, b) {
          var keyA = a.id,
            keyB = b.id;
          // Compare the 2 dates
          if (keyA < keyB) return -1;
          if (keyA > keyB) return 1;
          return 0;
        });
        this.gameProviders = arr;
        this.allGames = this.gameService.allGames;
        // this.categoryType = ;
        // this.filterData();
        // this.initPage();
      }else if (!res && this.gameService.providers && this.gameService.allGames) {
        this.gameService.updateGamesList();
      }
    })

    if (this.router.url.includes(OFFER_TYPES.FREESPIN)) {
      this.activatedRoute.params.subscribe(params => {
        this.displayBonusgames(OFFER_TYPES.FREESPIN, params['id']);
        this.subscribeRealTimeData('freespins_changes#');
      });

    }
    else if (this.router.url.includes(OFFER_TYPES.BONUS) && !this.router.url.includes('buys')) {
      this.activatedRoute.params.subscribe(params => {
        this.displayBonusgames(OFFER_TYPES.BONUS, params['id']);
        this.subscribeRealTimeData('bonuses_changes#');
      });
    } else {
      this.activatedRoute.data.subscribe(res => {
        this.categoryType = res.category;

        this.title = this.translate.instant(res.title);
        this.titleService.setTitle(this.title);
        this.new = (this.categoryType == Category.NEW) ? true : false;
        this.live = (this.categoryType == Category.LIVE_CASINO) ? true : false;
        this.tab=res?.tab
        // this.gameProviders = this.gameService.providers;
        // this.allGames = this.gameService.allGames;
      })
      window.addEventListener('scroll', this.getScrollHeight, true);

      this.initPage();
      this.onLanguageChange();
    }

  }

  getScrollHeight(event) {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
      this.showMore()
    }
  }

  onLanguageChange(){
    this.translate.onLangChange.subscribe(()=>{
      this.activatedRoute.data.subscribe(res => {
      this.title = this.translate.instant(res.title);
      this.titleService.setTitle(this.title);
      });
    })
  }

  initPage() {
    this.endIndex = DEFAULT_VALUES.INITIAL_INDEX + DEFAULT_VALUES.GAME_LIMIT;
    this.limit = DEFAULT_VALUES.GAME_LIMIT;
    this.allKeys = (Object.keys(this.allGames))
    this.providerSpecificKeys = [...this.allKeys];
    this.filterData();

  }

  filterData() {
    this.providerSpecificKeys = [...this.providerSpecificKeys];
    switch (this.categoryType) {
      case Category.NEW:
        this.sortKey = GAMES_FILTER_KEYS.NEW;
        break;
      case Category.POPULAR:
        this.sortKey = GAMES_FILTER_KEYS.POPULARITY;
        break;
      case Category.LIVE_CASINO:
        this.sortKey = GAMES_FILTER_KEYS.LIVE_CASINO;
        break;
      case Category.JACKPOT:
        this.sortKey = GAMES_FILTER_KEYS.JACKPOT;
        break;
      case Category.MEGAWAYS:
        this.sortKey = GAMES_FILTER_KEYS.MEGAWAYS;
        break;
      case Category.EPIC_WINS:
        this.sortKey = GAMES_FILTER_KEYS.EPIC_WINS;
        break;
      case Category.CLASSIC_FRUIT_MACHINES:
        this.sortKey = GAMES_FILTER_KEYS.CLASSIC_FRUIT_MACHINES;
        break;
      case Category.WIN_BOTH_WAYS:
        this.sortKey = GAMES_FILTER_KEYS.WIN_BOTH_WAYS;
        break;
      case Category.CLUSTER_PLAYS:
        this.sortKey = GAMES_FILTER_KEYS.CLUSTER_PLAYS;
        break;
      case Category.BONUS_BUYS:
        this.sortKey = GAMES_FILTER_KEYS.BONUS_BUYS;
        break;
      default:
        this.sortKey = null;
        if (!this.currentProvider) {
          this.providerSpecificKeys = [...this.providerSpecificKeys];
        } else {
          this.providerSpecificKeys = this.gameService.getGamesOfProvider(this.allGames, this.providerSpecificKeys, this.currentProvider)
        }
    }
    if (this.sortKey) {
      this.sortKey=this.gameService.isCollectionExists(this.gameService.collections,`${this.sortKey}:${this.translate.currentLang}`)?`${this.sortKey}:${this.translate.currentLang}`:this.sortKey;
      this.providerSpecificKeys = this.gameService.getFilteredGames(this.allGames, this.allKeys, this.sortKey);
    }
    this.displayKeys = this.providerSpecificKeys.slice(0, this.limit);
  }

  onSelectProvider(provider?: IGameProvider) {
    if (!provider) {
      this.currentProvider = undefined;
      this.filterData();
    } else {
      this.currentProvider = provider;
      this.providerSpecificKeys = this.gameService.getGamesOfProvider(this.allGames, this.allKeys, provider);
      if (this.sortKey) {
        this.sortKey=this.gameService.isCollectionExists(this.gameService.collections,`${this.sortKey}:${this.translate.currentLang}`)?`${this.sortKey}:${this.translate.currentLang}`:this.sortKey;
        this.providerSpecificKeys = this.gameService.getFilteredGames(this.allGames, this.providerSpecificKeys, this.sortKey);
      }

      this.displayKeys = this.providerSpecificKeys.slice(0, this.limit);
    }

  }

  /**
  * Function to show more list of games
  * if the component is containd by Home component the redirect it to game route and show more games list
  * @param event 
  */
  showMore() {
    this.endIndex = this.endIndex + this.limit;
    this.displayKeys = this.providerSpecificKeys.slice(0, this.endIndex);
  }

  playGame(event) {

  }

  onSearch(text) {
    if (!text) {
      this.filterData();
      return;
    }
    this.providerSpecificKeys = this.allKeys.filter(
      key => (!!this.allGames[key]['collections'][this.sortKey] && this.allGames[key].title.match(new RegExp(text, 'i'))));
    this.displayKeys = [...this.providerSpecificKeys];
  }

  displayBonusgames(type, id) {
    let api;
    // this.activatedRoute.data.subscribe(apiData => {
    //   if(apiData){
    //   this.gameProviders = apiData?.data[1]?.body;
    //   this.games = apiData?.data[2]?.body ;
    //   }
    // });
    if (type == OFFER_TYPES.FREESPIN) {
      api = APIS.PLAYER.FREESPINS;
    } else {
      api = APIS.PLAYER.BONUSES
    }
    this.httpService.getData(api).subscribe((res) => {
      let offers = res.body;
      // if(type==OFFER_TYPES.FREESPIN){
      //   offers = FREESPINS;
      // } else {
      //   offers=BONUSES;
      // }
      let offer = offers.find((obj) => {
        return obj.id == id;
      });
      if (offer) {
        this.title = `${offer.title} Games`;
        this.titleService.setTitle(this.title);
        let offeredGames = _.pickBy(this.games ||this.allGames, function (v, k) {
          let offerGame = offer.games.find(game => {
            return game == k;
          });
          return offerGame ? true : false;
        });
        this.allGames = Object.assign({}, offeredGames);
        this.initPage();
      }
    })
  }

  subscribeRealTimeData(channel_name) {
    this.realTimeService.subscribe(channel_name, function (resp) {
      console.log("Real time channel " + channel_name, resp);
      var gameData = resp.data;
      if (gameData?.round?.bet < gameData?.round?.win) {
        gameData.nickname = gameData.player.nickname;
        gameData.win_amount_cents = gameData.round.win;
        gameData.currency = gameData.round.currency;
        gameData.humanized_win = gameData.round.win;
        this.winners?.unshift(gameData);
      }
    });
  }
}
