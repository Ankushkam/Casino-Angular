import { CATEGORY_TABS } from '../../../core/interfaces/games';
import { Component, OnInit, Output, EventEmitter, Input, AfterViewInit, ViewEncapsulation, OnChanges } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.scss'],
  encapsulation:ViewEncapsulation.None  
})
export class CategoryListComponent implements OnInit, AfterViewInit,OnChanges {
  @Input() initCategory;
  @Input() categories;
  @Output() onSelectCategory = new EventEmitter();
  @Input() isGamePlay;
  @Output() showTabs= new EventEmitter();
  showGames=false;

  // categories = [...CATEGORY_TABS]
  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {
    if (this.router.url.includes('en-en')) {

      this.categories = this.categories.filter(item => {
        if (item.name == 'game_categories.megaways' || item.name == 'game_categories.classic_fruit_machines') {
          //console.log(item)
        } else {
          return item;
        }
      })
    }
  }
  ngAfterViewInit(): void {
    this.onClickCategory(this.initCategory)
  }
  ngOnChanges(): void {
    if((this.showGames && this.isGamePlay) || !this.isGamePlay ) {
      document.getElementById(this.initCategory?.id)?.classList.add('active');
      this.categories.forEach(obj => {
        if (obj.id != this.initCategory?.id) {
          document.getElementById(obj.id)?.classList.remove('active');
        }
      })
    }
  }


  onClickCategory(category) {
    if((this.showGames && this.isGamePlay) || !this.isGamePlay ) {
    document.getElementById(category.id).classList.add('active');
    this.categories.forEach(obj => {
      if (obj.id != category.id) {
        document.getElementById(obj.id).classList.remove('active');
      }
    })
    this.onSelectCategory.emit(category)
  }
  }

  onShowDiv() {
    this.showGames=!this.showGames;
    this.showTabs.emit(this.showGames);
  }

}
