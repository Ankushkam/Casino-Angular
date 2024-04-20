import { Router } from '@angular/router';
import { IWinner, WINNER_TYPE } from './../../../core/interfaces/winner';
import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { SlickCarouselComponent } from 'ngx-slick-carousel';
import { APIS, USER_DETAILS } from 'src/app/common/constants';
import { AuthService, HttpService } from 'src/app/core/services';

@Component({
  selector: 'app-winner',
  templateUrl: './winner.component.html',
  styleUrls: ['./winner.component.scss']
})
export class WinnerComponent implements OnInit {
  @Input() winners: IWinner[];
  allWinners;
  winnerList
  @Input() winnerType: WINNER_TYPE;
  @Input() smallTitle: boolean;
  // slideConfig = { "slidesToShow": 5, "slidesToScroll": 1 ,vertical:true, autoPlay:true, speed:300,infinite:true,arrows:true};
  slideConfig = {
    "slidesToShow" : 3,
    "slidesToScroll": 1,
    "arrows":false,
    "vertical":true,
    "autoplay" : true,
    "autoplaySpeed" : 2000,
    "pauseOnHover": false,
    "pauseOnFocus": false,
    "verticalReverse": false,    
    // "adaptiveHeight": true,
  };
  @ViewChild('slickModal') slickModal: SlickCarouselComponent;

  constructor(private router: Router,private httpService:HttpService,private authService:AuthService) { }

  ngOnInit(): void {
    this.getLatestWinners();
    this.slickModal?.unslick();
    this.slickModal?.initSlick();
  }

  getName(name: string) {
    return name.split(' ').map(obj => obj[0]).join('.');
  }

  playGame(winner: IWinner) {
    if (this.authService.authentication.value) {
      this.router.navigate(['/play-games', winner.game_identifier]);
    } else {
      // this.router.navigate(['/users/sign_in']);
      this.router.navigate(['/play-games-for-fun', winner.game_identifier]);

    }
  }

  private filterWinners() {
    let currency = this.authService.getUserData(USER_DETAILS.Currency);
    // this.topFiveWinners = (currency) ? this.winnerList.filter(obj => obj.currency == currency).slice(0, 20) : this.winnerList?.slice(0, 20);


    this.allWinners = (currency) ? this.winnerList?.filter(obj => (obj.currency == currency&&obj.win_amount_cents>=200)) : this.winnerList.filter(obj => (obj.win_amount_cents>=200)) ;

    if (this.allWinners?.length == 0) {
      this.allWinners = this.winnerList;
    }
  }

  // Function to get the latest winners
  getLatestWinners() {
    this.httpService.getData(APIS.WINNERS).subscribe(res => {
      this.winnerList = res.body;
      this.filterWinners();
    })
  }
}
