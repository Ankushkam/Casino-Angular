import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-games-slider',
  templateUrl: './games-slider.component.html',
  styleUrls: ['./games-slider.component.scss']
})
export class GamesSliderComponent implements OnInit {
  @Input() allGames: any;
  @Input() displayKeys: string[];
  @Input() limit: number;
  @Output() onPlayGame = new EventEmitter();
  slideConfig = { "slidesToShow": 8, "slidesToScroll": 1 };
  width;
  constructor(private router: Router) { }

  ngOnInit(): void {
    this.width=window.innerWidth;
  }

  /**
 * Function return the image url based 
 * @param identifier 
 */
  getImageURL(identifier: string) {
    return `${environment.imgBaseURL}/i/s3/${identifier}.png`;
  }

  /**
   * Function to play game 
   * @param key 
   */
  playGame(key: string) {
    this.onPlayGame.emit(key)
    this.router.navigate(['/play-games', key])
    return
    // this.onPlayGame.emit(game);
  }

  playForFun(key:string) {
    this.onPlayGame.emit(key)
    this.router.navigate(['/play-games-for-fun', key])
    return
  }
}
