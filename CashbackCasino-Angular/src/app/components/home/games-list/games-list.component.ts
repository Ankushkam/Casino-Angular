import { Router } from '@angular/router';
import { environment } from './../../../../environments/environment.staging';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { GAMES_LIST, USER_DETAILS } from 'src/app/common/constants';
import { AuthService } from 'src/app/core/services';

@Component({
  selector: 'app-games-list',
  templateUrl: './games-list.component.html',
  styleUrls: ['./games-list.component.scss']
})
export class GamesListComponent implements OnInit {

  @Input() displayKeys: string[];
  @Input() allGames: any;
  @Input() isNew: boolean;
  @Input() isLive:boolean;
  userCurrency;
  isLoggedIn: boolean;
  displayPlayButtons;

  @Output() onPlayGame = new EventEmitter();
  limit = GAMES_LIST.NEW_GAMES_RIBBON_SHOW_LIMIT;
  width;


  constructor(
    private router: Router,
    private authService:AuthService
  ) { }

  ngOnInit(): void {
    this.userCurrency = this.authService.getUserData(USER_DETAILS.Currency) || 'EUR';
    this.width=window.innerWidth;
    this.authService.authentication.subscribe(res=>{this.isLoggedIn=res;})
  }

  /**
 * Function return the image url based 
 * @param identifier 
 */
  getImageURL(identifier: string) {
    return `${environment.imgBaseURL}/i/s3/${identifier}.png`;
  }

  getjackpotMoney(identifier){
    return this.allGames[identifier]?.real[this.userCurrency].jackpot || ''
  }

 

  playGame(key: string) {
   
    this.router.navigate(['/play-games', key])
    return
    // this.onPlayGame.emit(game);
  }

  show(key,index) {
    this.displayPlayButtons=`${key.offsetHeight} ${key.offsetLeft} ${index}`;
  }  

  getFocus(elem,index) {
    return `${elem.offsetHeight} ${elem.offsetLeft} ${index}`;
  }

  playForFun(key:string) {
    this.router.navigate(['/play-games-for-fun', key])
    return
  }

}
