import { Component, OnInit, Input } from '@angular/core';
import { GAMES_LIST, APIS ,TOURNAMENTS, USER_DETAILS} from 'src/app/common/constants';
import { IGameProvider } from 'src/app/core/interfaces/games';
import { GamesService } from '../../home/games/games.service';
import { HttpService, AuthService } from 'src/app/core/services';
import { HeaderService } from 'src/app/core/services/header.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'casino-tournament',
  templateUrl: './casino-tournament.component.html',
  styleUrls: ['./casino-tournament.component.scss']
})
export class CasinoTournamentComponent implements OnInit {

  @Input() identifier; // for game identifier
  @Input() template; // for identifying new game or game banner
  @Input() params;
  TEMPLATE_TYPE=TOURNAMENTS.TEMPLATE_TYPE;
  allGames: any;
  GAME_LIST = { ...GAMES_LIST }
  tournament;
  tournamentDate;
  topWinners=[];
  status;
  currency;
  constructor(
    private gameService: GamesService,
    private httpService:HttpService,
    private authService:AuthService,
    private translate:TranslateService
    ) { 
    }

  ngOnInit(): void {

    this.currency = this.authService.getUserData(USER_DETAILS.Currency) || 'EUR';
    this.httpService.getData(APIS.TOURNAMENTS.TOURNAMENTS).subscribe((res)=>{
      let tournaments=res.body.filter((record)=>{
        return record.currency==this.currency;
      })
      this.getCurrentTournament(res.body);
    })
  }

  getCurrentTournament(tournaments) {
    this.tournament=tournaments.find((tournament)=>{
      return tournament.frontend_identifier==this.identifier;
    });
    if(this.tournament) {
    this.topWinners=this.tournament.top_players;
    this.filterDate(this.tournament.start_at,this.tournament.end_at)
    }
  }

  filterDate(startDate,endDate)  {
    let now=new Date();
    if(now<new Date(startDate)) {
      this.status=this.translate.instant('title.upcoming');
      this.tournamentDate=new Date(startDate);
    }
    else if(now>new Date(startDate) && now< new Date(endDate)) {
      this.status=this.translate.instant('title.going');
      this.tournamentDate=new Date(endDate)
    }
  }

}
