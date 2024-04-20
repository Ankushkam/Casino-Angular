import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpService } from './http.service';
import { NotificationService } from './notification.service';
import { RealTimeService } from './real-time.service';
@Injectable({
    providedIn: 'root'
  })
  export class TournamentsService {
      tournaments= new BehaviorSubject(null);
      constructor(private httpService:HttpService,private notificationService:NotificationService, private realTimeService:RealTimeService) {

      }

      fetchTournaments() {
        this.httpService.getData('/api/tournaments/statuses').subscribe((res)=>{
            this.tournaments.next(res.body);
          });
      }

      subscribeRealTimeData() {
        this.realTimeService.subscribe('tournaments_statuses#', (resp) => {
            console.log("Real time channel tournaments_statuses", resp);
            this.updatedTournaments(resp.data);
        });
        }
    updatedTournaments(data) {
        let tournaments= this.tournaments.value;
        let updatedTournament=tournaments.find((tournament)=>{
            return tournament.id==data.id;
        });

        if(updatedTournament) {
            this.notificationService.onTournamentAdded("tournaments",data);

        } else {
            this.notificationService.onTournamentAdded("tournaments",data);
        }
      }

      initSubscriptions() {
        // this.fetchTournaments();
        this.subscribeRealTimeData();
      }
  }