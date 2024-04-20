import { Component, OnInit, Output,EventEmitter, Input, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DEFAULT_VALUES } from 'src/app/common/constants';
import { GamesService } from 'src/app/components/home/games/games.service';
import { Category, IGameProvider } from 'src/app/core/interfaces/games';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-game-search',
  templateUrl: './game-search.component.html',
  styleUrls: ['./game-search.component.scss']
})
export class GameSearchComponent implements OnInit, OnDestroy {

  @Output() onKeyPress = new EventEmitter();
  @Output() playGame= new EventEmitter();
  searchValue;
  categoryType: Category=Category.ALL;
  gameProviders: IGameProvider[];
  @Input() allGames: any;
  games: any;
  @Input() allKeys: string[];
  displayKeys: string[];
  providerSpecificKeys: string[];
  placeholder;
  endIndex;
  limit;
  loadedPages=1;
  

  constructor(private translate:TranslateService, private gameService:GamesService) {
    this.getScroll = this.getScroll.bind(this)
   }

  ngOnInit(): void {
    // this.endIndex = DEFAULT_VALUES.INITIAL_INDEX + DEFAULT_VALUES.GAME_LIMIT;
    this.limit = DEFAULT_VALUES.GAME_LIMIT;
    this.placeholder=this.translate.instant('forms.placeholder.game_search');
    this.gameService.clearSearch.subscribe((res)=>{
      if(res){
      this.onKeyPress.emit('');
      this.searchValue='';
      this.endIndex=this.limit;
      this.loadedPages=1;
      }
    })
    window.addEventListener('scroll', this.getScroll, true);
  }

  getScroll(event) {    
    let scrollHeight=document.getElementById('scrolled')?.scrollTop;
    let height=document.getElementById('scrolled')?.clientHeight;
    if(height) {
    let currentPage=scrollHeight/height;
    if(currentPage>this.loadedPages){
      this.showMore();
      this.loadedPages=Math.ceil(currentPage);
    }
  }
  }

  showMore() {
    this.endIndex = this.endIndex + this.limit;
    this.displayKeys = this.providerSpecificKeys?.slice(0, this.endIndex);
  }

  onSearch(event) {
    this.endIndex=this.limit;
    this.loadedPages=1;
    this.onKeyPress.emit(event.target.value);
    if (!event.target.value) {
      this.providerSpecificKeys=[];
      this.displayKeys=[];
      return;
    }
    this.providerSpecificKeys = this.allKeys.filter(
      key => (this.allGames[key].title.match(new RegExp(event.target.value, 'i'))));
    // this.displayKeys = [...this.providerSpecificKeys];
    this.showMore();
  }

    /** This allows the "clear search" X button to properly update the value for Edge & IE browsers */
detectSearchClear($event: Event): void {
  if ($event.target) {
      const inputEl = $event.target as HTMLInputElement;
      const beforeVal = inputEl.value;
      setTimeout(() => {
          const afterVal = inputEl.value;
          if (beforeVal !== '' && afterVal === '') {
            this.onKeyPress.emit('');
            this.searchValue='';
          }
      }, 1);
  }
}

playSearchGame(key) {
  this.searchValue="";
  this.displayKeys=[];
  this.endIndex=this.limit;
  this.loadedPages=1;
  this.playGame.emit(key);
}

getPlaceholder() {
  return this.translate.instant('text.search_games');
}

getImageURL(identifier: string) {
  return `${environment.imgBaseURL}/i/s3/${identifier}.png`;
}

ngOnDestroy(){
  if (this.getScroll) {
    window.removeEventListener('scroll', this.getScroll, true);
  }
}

}
