import { DEFAULT_VALUES, GAMES_FILTER_KEYS, GAMES_LIST } from './../../../common/constants';
import { IGameProvider, ICollection, Category, CATEGORY_TABS, Sub_Category } from './../../../core/interfaces/games';
import { GamesService } from './games.service';
import { Router, ActivatedRoute } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { Component, OnInit, Inject, Input, HostListener } from '@angular/core';
import * as _ from 'lodash';
import { TranslateService } from '@ngx-translate/core';
import { SharedService } from 'src/app/core/services';

@Component({
  selector: 'app-games',
  templateUrl: './games.component.html',
  styleUrls: ['./games.component.scss']
})
export class GamesComponent implements OnInit {
  @Input() allGames: any;
  @Input() providerKeys;
  @Input() gameProviders: IGameProvider[];
  @Input() pageTitle: string;
  @Input() category: Category;
  @Input() mainCategory;
  @Input() page;
  @Input() currentProvider: any;
  @Input() categories;
  @Input() type;
  @Input() tab;
  GAME_LIST = { ...GAMES_LIST };

  // categories = [...CATEGORY_TABS]

  newGames: string[] = [];
  popularGames: string[] = [];
  jackpots: string[] = [];
  live: string[] = [];
  megaways=[];
  epicWins=[];
  fruitMachine=[];
  winBothWays=[];
  clusterPlays=[];
  bonusBuys=[];
  title: string;
  sortKey: string;
  endIndex: number;
  index: any;
  limit: number;
  allKeys: string[];
  currentCategory: any;
  displayKeys: string[];
  providerSpecificKeys: string[];
  new: boolean;
  islive: boolean;

  maxInRow: number
  noOfRows:number;
  maxGames:number

  gameCollection: ICollection[];
  previousText: any;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    public router: Router,
    private gameService: GamesService,
    private translate:TranslateService,
    private sharedService:SharedService
  ) {
    this.getScrollHeight = this.getScrollHeight.bind(this);
  }

  ngOnInit(): void {
    let screen=document.body;
    screen.scrollTop=0;
    // let screen=this.document.body;
    
    // screen.addEventListener('scroll', () => {  
    //   if (event.target.scrollTop > 0) {
    //     if(document.getElementsByClassName('move_down_arrow')[0]){
    //       if(document.getElementsByClassName('move_down_arrow')[0].classList.contains('hide')){
    //         document.getElementsByClassName('move_down_arrow')[0].classList.remove('hide');
    //       }
    //     }
       
    //   }  
    //   if (screen.offsetHeight + screen.scrollTop >= screen.scrollHeight) {  
    //     console.log('scrolled to bottom') ;
    //     if(this.document.getElementsByClassName('move_down_arrow')[0]){
    //       this.document.getElementsByClassName('move_down_arrow')[0].classList.add('hide');
    //     }
    //   }  
    // })
    if(!this.categories) {
      this.categories=[...CATEGORY_TABS];
    }
    if (this.currentProvider && Object.keys(this.currentProvider).length == 0) {
      this.currentProvider = { title: this.translate.instant('title.suppliers') };
    }
    this.maxInRow = (window.innerWidth <= 767) ? DEFAULT_VALUES.MAX_GAMES_IN_ROW_MOBILE : DEFAULT_VALUES.MAX_GAMES_IN_ROW_DESKTOP;
    this.noOfRows = (window.innerWidth <= 767) ? DEFAULT_VALUES.DISPLAY_DEFAULT_ROWS_MOBILE : DEFAULT_VALUES.DISPLAY_DEFAULT_ROWS_DESKTOP;
    this.maxGames=this.maxInRow*this.noOfRows;

    this.gameService.updateList.subscribe(res => {
      if (res&&this.sharedService.currentIP.value.country_code !== 'US') {
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
        this.initPage()
      } else if (!res && this.gameService.providers && this.gameService.allGames) {
        this.gameService.updateGamesList();
      }
    })

    // if (!this.pageTitle) {
    //   window.addEventListener('scroll', this.getScrollHeight, true);
    // }

    this.initPage();
    this.onLanguageChange();
  }

  getScrollHeight(event) {

    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
     
      this.showMore()
    }
  }

  onLanguageChange() {
    if (this.currentProvider && Object.keys(this.currentProvider).length == 0) {
      this.currentProvider = { title: this.translate.instant('title.suppliers') };
    }
  }

  initPage() {
    this.limit = DEFAULT_VALUES.SHOW_MORE_ROWS*(this.maxInRow);
    this.endIndex = DEFAULT_VALUES.INITIAL_INDEX + this.limit;
    if(this.type==GAMES_LIST.CATEGORY_GAMES) {
      this.allKeys = [...this.providerKeys]
    } else {
      this.allKeys = (Object.keys(this.allGames))
    }
    this.providerSpecificKeys = [...this.allKeys];
    this.onClickCategory(this.categories[this.tab] || this.categories[0]);
  }

  filterData() {
    if(this.type==GAMES_LIST.CATEGORY_GAMES) {
      switch (this.index) {
        case Sub_Category.LIVE_ALL:
          this.sortKey = GAMES_FILTER_KEYS.LIVE_ALL;
          break;
        case Sub_Category.BACCARAT:
          this.sortKey = GAMES_FILTER_KEYS.BACCARAT;
          if(!this.router.url.includes('baccarat')){
            this.router.navigate(['/live-casino/baccarat'])
          }
          break;
        case  Sub_Category.ROULLETE:
          this.sortKey = GAMES_FILTER_KEYS.ROULLETE;
          // if(!this.router.url.includes('roulette')){
          //   this.router.navigate(['/live-casino/roulette'])
          // }
          break;
        case  Sub_Category.BLACKJACK:
          this.sortKey = GAMES_FILTER_KEYS.BLACKJACK;
          // if(!this.router.url.includes('blackjack')){
          //   this.router.navigate(['/live-casino/blackjack'])
          // }
          break;
        case  Sub_Category.POKER:
          this.sortKey = GAMES_FILTER_KEYS.POKER;
          // if(!this.router.url.includes('poker')){
          //   this.router.navigate(['/live-casino/poker'])
          // }
          break;
        case  Sub_Category.CARD_GAMES:
          this.sortKey = GAMES_FILTER_KEYS.CARD;
          // if(!this.router.url.includes('card-games')){
          //   this.router.navigate(['/live-casino/card-games'])
          // }
          break;
        case  Sub_Category.LIVE_POPULAR:
          this.sortKey=GAMES_FILTER_KEYS.LIVE_POPULAR;
          // if(!this.router.url.includes('popular')){
          //   this.router.navigate(['/live-casino/popular'])
          // }
          break;
        default:
          this.sortKey = null;
      }
    } else {
    switch (this.index) {
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
    }
  }
    this.index = this.categories.findIndex(obj => obj.id == this.currentCategory.id);
    if (!(this.currentProvider || {}).id) {
      this.providerSpecificKeys = [...this.allKeys];
    } else {
      this.providerSpecificKeys = this.gameService.getGamesOfProvider(this.allGames, this.allKeys, this.currentProvider)
    }
    if (this.sortKey) {
      this.sortKey=this.gameService.isCollectionExists(this.gameService.collections,`${this.sortKey}:${this.translate.currentLang}`)?`${this.sortKey}:${this.translate.currentLang}`:this.sortKey;
      this.providerSpecificKeys = this.gameService.getFilteredGames(this.allGames, this.providerSpecificKeys, this.sortKey);

    } else if (this.pageTitle == GAMES_LIST.HOME_TITLE && this.index == Category.ALL) {
      this.categorizeGame();
    }else if (this.pageTitle == GAMES_LIST.HOME_TITLE && this.index == Category.LIVE_CASINO) {
      this.categorizeLiveGames();
    } 
    // else if(this.type==GAMES_LIST.CATEGORY_GAMES && this.index==Sub_Category.OTHERS) {
    //   this.providerSpecificKeys=this.getOtherGames();
    // }
    this.displayKeys = this.providerSpecificKeys.slice(0, this.limit);
  }

  private categorizeGame() {
    this.newGames = this.gameService.getFilteredGames(this.allGames, this.providerSpecificKeys, this.getCountrySortKey(GAMES_FILTER_KEYS.NEW)).slice(0, this.maxGames);
    this.popularGames = this.gameService.getFilteredGames(this.allGames, this.providerSpecificKeys, this.getCountrySortKey(GAMES_FILTER_KEYS.POPULARITY)).slice(0, this.maxGames);
    this.jackpots = this.gameService.getFilteredGames(this.allGames, this.providerSpecificKeys, this.getCountrySortKey(GAMES_FILTER_KEYS.JACKPOT)).slice(0, this.maxGames);
    this.live = this.gameService.getFilteredGames(this.allGames, this.providerSpecificKeys, this.getCountrySortKey(GAMES_FILTER_KEYS.LIVE_CASINO)).slice(0, this.maxGames);
    this.megaways=this.gameService.getFilteredGames(this.allGames, this.providerSpecificKeys, this.getCountrySortKey(GAMES_FILTER_KEYS.MEGAWAYS)).slice(0, this.maxGames);
    this.epicWins=this.gameService.getFilteredGames(this.allGames, this.providerSpecificKeys, this.getCountrySortKey(GAMES_FILTER_KEYS.EPIC_WINS)).slice(0, this.maxGames);
    this.fruitMachine=this.gameService.getFilteredGames(this.allGames, this.providerSpecificKeys, this.getCountrySortKey(GAMES_FILTER_KEYS.CLASSIC_FRUIT_MACHINES)).slice(0, this.maxGames);
    this.winBothWays=this.gameService.getFilteredGames(this.allGames, this.providerSpecificKeys, this.getCountrySortKey(GAMES_FILTER_KEYS.WIN_BOTH_WAYS)).slice(0, this.maxGames);
    this.clusterPlays=this.gameService.getFilteredGames(this.allGames, this.providerSpecificKeys, this.getCountrySortKey(GAMES_FILTER_KEYS.CLUSTER_PLAYS)).slice(0, this.maxGames);
    this.bonusBuys=this.gameService.getFilteredGames(this.allGames, this.providerSpecificKeys, this.getCountrySortKey(GAMES_FILTER_KEYS.BONUS_BUYS)).slice(0,this.maxGames)
    // this.live = _.shuffle(this.live)
  }

  getOtherGames() {
    let roulette = this.gameService.getFilteredGames(this.allGames, this.providerSpecificKeys, GAMES_FILTER_KEYS.ROULLETE);
    let bacarrat = this.gameService.getFilteredGames(this.allGames, this.providerSpecificKeys, GAMES_FILTER_KEYS.BACCARAT);
    let blackjack= this.gameService.getFilteredGames(this.allGames, this.providerSpecificKeys, GAMES_FILTER_KEYS.BLACKJACK);
    blackjack=[...blackjack,...roulette,...bacarrat];
    let other=_.difference(this.allKeys,blackjack);
    return other
  }

  getCountrySortKey(sortKey) {
    return this.gameService.isCollectionExists(this.gameService.collections,`${sortKey}:${this.translate.currentLang}`)?`${sortKey}:${this.translate.currentLang}`:sortKey; 
  }

  private categorizeLiveGames() {
    this.live=this.gameService.getFilteredGames(this.allGames, this.providerSpecificKeys, this.getCountrySortKey(GAMES_FILTER_KEYS.LIVE_CASINO))
  }

  /**
   * Functio exucute whenever any provider will select from dropdown
   * This Function will set all the specific provider keys
   * @param provider 
   */
  onSelectProvider(provider?: IGameProvider) {
    if (!provider) {
      this.currentProvider = undefined;
      this.providerSpecificKeys = [...this.allKeys];
    } else {
      this.currentProvider = provider;
      this.providerSpecificKeys = this.gameService.getGamesOfProvider(this.allGames, this.allKeys, provider);
    }
    this.endIndex = DEFAULT_VALUES.INITIAL_INDEX + this.limit;
    this.index = this.categories.findIndex(obj => obj.id == this.currentCategory.id);
    this.filterData();
  }


  @HostListener("window:scroll", [])
  onScroll(): void {
    // if (this.bottomReached()) {
    //   this.elements = [...this.elements, this.count++];
    // }
  }

  bottomReached(): boolean {
    return (window.innerHeight + window.scrollY) >= document.body.offsetHeight;
  }

  /**
   * function 
   * @param id 
   */
  // @HostListener('click', ['$event.target.id'])
  onClickCategory(category) {
    // console.log("========categories====",category)
    this.gameService.clearSearchBox(true);
    this.currentCategory = { ...category };
    this.title = category.name;
    this.endIndex = DEFAULT_VALUES.INITIAL_INDEX + this.limit;
    this.index = this.categories.findIndex(obj => obj.id == category.id);
    this.new = (this.index == Category.NEW) && this.type!=GAMES_LIST.CATEGORY_GAMES ? true : false;
    this.islive=((this.index == Category.LIVE_CASINO) && this.type!=GAMES_LIST.CATEGORY_GAMES) || this.type==GAMES_LIST.CATEGORY_GAMES ? true : false;
    // console.log("--------------",this.islive)
    this.filterData();
  }

  /** Function to search the games */
  onSearch(text) {
    if(!this.previousText ){
      this.previousText=text;
    }else{
      if(this.previousText.length < text.length){
        this.filterData();
      }
    }
    if (!text) {
      // this.onClickCategory(this.index);
      this.filterData();
      return;
    }
    if (this.sortKey) {
      this.sortKey=this.gameService.isCollectionExists(this.gameService.collections,`${this.sortKey}:${this.translate.currentLang}`)?`${this.sortKey}:${this.translate.currentLang}`:this.sortKey;
      this.providerSpecificKeys = this.gameService.getFilteredGames(this.allGames, this.allKeys, this.sortKey);
      this.providerSpecificKeys = this.providerSpecificKeys.filter(key => (!!this.allGames[key]['collections'][this.sortKey] && this.allGames[key].title.match(new RegExp(text, 'i'))));
    } else if (this.pageTitle == GAMES_LIST.HOME_TITLE) {
      this.providerSpecificKeys = this.allKeys.filter(key => (this.allGames[key].title.match(new RegExp(text, 'i'))));
      this.categorizeGame();
      return;
    } else {
      this.providerSpecificKeys = this.providerSpecificKeys.filter(key => (this.allGames[key].title.match(new RegExp(text, 'i'))));
    }
    this.displayKeys = [...this.providerSpecificKeys];
  }

  /**
   * Function to show more list of games
   * if the component is containd by Home component the redirect it to game route and show more games list
   */
  showMore() {
    // if(this.document.getElementsByClassName('move_down_arrow')[0]){
    //   this.document.getElementsByClassName('move_down_arrow')[0].classList.remove('hide');
    // }
    if (this.pageTitle == GAMES_LIST.HOME_TITLE) {
      this.router.navigate(['/casino']);
    } else {
      this.endIndex = this.endIndex + this.limit;
      this.displayKeys = this.providerSpecificKeys.slice(0, this.endIndex);
    }
  }

  seeAll(index?) {
    if (!index) {
      index = this.categories.findIndex(obj => obj.id == this.currentCategory.id);
    }
    switch (index) {
      case Category.NEW:
        this.router.navigate(['/new-games'])
        break;
      case Category.POPULAR:
        this.router.navigate(['/popular-games'])
        break;
      case Category.LIVE_CASINO:
        this.router.navigate(['/live-casino'])
        break;
      case Category.JACKPOT:
        this.router.navigate(['/jackpot'])
        break;
      case Category.MEGAWAYS:
        this.router.navigate(['/megaways'])
        break;
      case Category.EPIC_WINS:
        this.router.navigate(['/epic-wins'])
        break;
      case Category.CLASSIC_FRUIT_MACHINES:
        this.router.navigate(['/fruit-machines'])
        break;
      case Category.CLUSTER_PLAYS:
        this.router.navigate(['/cluster-plays'])
        break;
      case Category.WIN_BOTH_WAYS:
        this.router.navigate(['/win-both-ways'])
        break;
        case Category.BONUS_BUYS:
          this.router.navigate(['/bonus-buys'])
          break;
      default:
        this.router.navigate(['/casino'])
    }
  }

  playGame(game: any) {
    // window.open(`${environment.apiUrl}${game.demo}`, '_blank');
  }

}
