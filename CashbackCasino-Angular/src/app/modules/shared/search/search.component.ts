import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { GamesService } from 'src/app/components/home/games/games.service';

@Component({
  selector: 'app-search',
  template: `<div class="search-box form-group">
            <input [(ngModel)]="searchValue" (mouseup)="detectSearchClear($event)" type="search" placeholder="{{getPlaceholder()}}" class="form-control" (keyup)="onSearch($event)" />
          </div>`
})
export class SearchComponent implements OnInit {
  @Output() onKeyPress = new EventEmitter();
  searchValue;
  constructor(private translate:TranslateService, private gameService:GamesService) { }

  ngOnInit(): void {
    this.gameService.clearSearch.subscribe((res)=>{
      if(res){
      this.onKeyPress.emit('');
      this.searchValue='';
      }
    })
   }

  onSearch(event) {
    this.onKeyPress.emit(event.target.value);
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

  getPlaceholder() {
    return this.translate.instant('text.search_games');
  }

}
