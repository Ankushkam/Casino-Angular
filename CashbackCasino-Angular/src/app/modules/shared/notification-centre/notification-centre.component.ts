import { Component, OnInit, Input, ViewEncapsulation, Output, EventEmitter} from '@angular/core';
import { NotificationService } from 'src/app/core/services/notification.service';
import { ModalService, SharedService } from 'src/app/core/services';
import { BonusesModalComponent } from '../../users/bonuses/bonuses-modal/bonuses-modal.component';
import { Router } from '@angular/router';
import { DepositsComponent } from '../../users/payments/deposits/deposits.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';
import { NOTIFICATION_TYPES } from 'src/app/common/constants';
import { DatePipe } from '@angular/common';
import { GamesService } from 'src/app/components/home/games/games.service';
import { environment } from 'src/environments/environment';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-notification-centre',
  templateUrl: './notification-centre.component.html',
  styleUrls: ['./notification-centre.component.scss'],
  encapsulation:ViewEncapsulation.None
})
export class NotificationCentreComponent implements OnInit {

  @Input() type;
  @Output() clickNotification= new EventEmitter();
  notificationItems=[];
  allGames=[];
  datePipe: DatePipe;
  constructor(private gameService:GamesService,private translate:TranslateService,private notificationService:NotificationService, private ngModal:NgbModal,private router:Router,private modalService:ModalService,private sharedService:SharedService) { }

  ngOnInit(): void {
    this.notificationService.notificationsList.subscribe((res)=>{
      this.gameService.updateList.subscribe((res)=>{
        if(res&& this.sharedService.currentIP.value.country_code!=='US'){
          this.allGames=this.gameService.allGames
          if(res && res.length>0){
            // this.notificationItems=res;
            sessionStorage.setItem('notifications', JSON.stringify(res));
            this.filterNotifications(res);
            } else if(JSON.parse(sessionStorage.getItem('notifications'))) {
              this.filterNotifications(JSON.parse(sessionStorage.getItem('notifications')));
            }
        }
      })
      
    });

  }

  /**
   * Filter the notifications on the basis of its type
   * @param notificationsList 
   */

  filterNotifications(notificationsList) {
    this.notificationItems=[];
    notificationsList.forEach((notification)=>{
      let data={};
      data['title']=notification.type;
      data['data']=notification.data
      
      if (notification.event == "updated") {
        if (notification.type == NOTIFICATION_TYPES.BONUS || notification.type == NOTIFICATION_TYPES.WAGER_DONE ) {
          data['description']=this.filterBonusDescription(notification);
        }
        if(notification.type==NOTIFICATION_TYPES.FREESPINS) {
          //data: {current:value,previous:value};
          data['description']=this.filterFreespinDescription(notification);
        }
        data['endDate']=(((notification || {}).data || {}).current || {}).activatable_until || (((notification || {}).data || {}).current || {}).valid_until || null;
      } else {
        if(notification.type==NOTIFICATION_TYPES.FREESPINS || notification.type==NOTIFICATION_TYPES.BONUS || notification.type==NOTIFICATION_TYPES.WAGER_DONE){
          data['endDate']=((notification || {}).data || {}).activatable_until || ((notification || {}).data || {}).valid_until || null;
        data['description']=this.translate.instant('notifications_text.bonus_added',{title:notification.data.title});
        }
        else if(notification.type==NOTIFICATION_TYPES.PAYMENT){
          // data['description']=`${notification.data.action} of ${notification.data.amount_cents} ${notification.data.currency} through ${notification.data.payment_system} payment method is`;
          data['description']=this.translate.instant('notifications_text.payment',{action:notification.data.action,amount:notification.data.amount_cents,currency:notification.data.currency,payment_system:notification.data.payment_system})
          if(notification.data.success && notification.data.finished_at) {
            data['description']=data['description'] + this.translate.instant('notifications_text.completed');
          } else if(!notification.data.success && notification.data.finished_at) {
            data['description']=data['description'] + this.translate.instant('notifications_text.rejected');
          } else if(!notification.data.success && !notification.data.finished_at) {
            data['description']=data['description'] + this.translate.instant('notifications_text.pending');
          }
          }
          else if(notification.type==NOTIFICATION_TYPES.TOURNAMENT) {
            data['description']=this.translate.instant('notifications_text.tournament',{nickname:notification.data.nickname,award_place:notification.data.award_place,points:notification.data.points,games_taken:notification.data.games_taken});
          }
          else if(notification.type==NOTIFICATION_TYPES.STATUS) {
            data['description']=this.translate.instant('notifications_text.level',{level:notification.data.level,points:notification.data.points});
          }
          // else if(notification.type==NOTIFICATION_TYPES.GROUPS) {

          // } 
          else if(notification.type==NOTIFICATION_TYPES.GAME_LIMITS) {
            data['description']=this.filterGameLimits(notification);
          } 
          else if(notification.type==NOTIFICATION_TYPES.WINNERS) {
            // data['description']=`${notification.data.player.nickname} have won ${notification.data.round.win} ${notification.data.round.currency} with bet of ${notification.data.round.bet} ${notification.data.round.currency} in ${this.allGames[notification.data.game.identifier].title}`
            data['description']=this.translate.instant('notifications_text.winners',{nickname:notification.data.player.nickname,win:notification.data.round.win,currency:notification.data.round.currency,bet:notification.data.round.bet,game_title:this.allGames[notification.data.game.identifier].title});
          }
      }
      if(data['endDate']) {
        data['endDate']=new Date(data['endDate']);
      }
      this.notificationItems.push(data);
    });
  }

  /**
   * Navigation on clicking the notification
   * @param notification 
   */
  onClick(notification) {
    if(this.type=='mobile'){
    this.clickNotification.emit(true);
    }
    let title=notification.title;
    if(title==NOTIFICATION_TYPES.FREESPINS || title==NOTIFICATION_TYPES.BONUS || title==NOTIFICATION_TYPES.WAGER_DONE) {
      this.modalService.openModal(BonusesModalComponent);
    }
    if(title==NOTIFICATION_TYPES.TOURNAMENT) {
      this.router.navigate(['/tournaments']);
    }
    if(title==NOTIFICATION_TYPES.PAYMENT) {
      this.ngModal.open(DepositsComponent, {
        size: 'lg',
        keyboard: false,
        windowClass: 'modal-active'
      });
    }
    if(title==NOTIFICATION_TYPES.STATUS) {
      this.router.navigate(['/loyalty-program']);
    }
  }

  difference(object, base) {
    return _.transform(object, (result, value, key) => {
        if (!_.isEqual(value, base[key])) {
            result[key] = _.isObject(value) && _.isObject(base[key]) ? this.difference(value, base[key]) : value;
           
        }
    });
}

close(notification,index){
  this.notificationItems.splice(index,1);
  sessionStorage.setItem('notifications', JSON.stringify(this.notificationItems));
}

/**
 * Filter notification description for bonuses and wager done
 * @param notification 
 */

filterBonusDescription(notification) {
  let updatedobj = this.difference(notification.data.current, notification.data.previous)
  if (updatedobj['stage']) {
    if (updatedobj['stage'] === 'lost' || updatedobj['stage'] === 'canceled' || updatedobj['stage'] === 'expired') {
      // return `${notification.data.current.title} has been ${updatedobj['stage']}`;
      return this.translate.instant('notifications_text.bonus_expired',{title:notification.data.current.title,stage:updatedobj['stage']})
    }
    else if (updatedobj['stage'] === 'issued' ) {
      if (notification.data.current['activatable_until']) {
        console.log("Your Bonus has been issued and activatable upto " + notification.data.current['activatable_until']);
        // return `${notification.data.current.title} has been issued and activatable upto ${this.datePipe.transform(new Date(notification.data.current['activatable_until']), 'dd-MM-yyyy')}`;
        return this.translate.instant('notifications_text.bonus_issued_and_activatable',{title:notification.data.current.title,activatable_until:this.datePipe?.transform(new Date(notification.data.current['activatable_until']), 'dd-MM-yyyy') || new Date(notification.data.current['activatable_until']).toDateString()})
      }
      else {
        // return `${notification.data.current.title} has been issued `;
        return this.translate.instant('notifications_text.bonus_issued',{title:notification.data.current.title})

      }
    }
    else if (updatedobj['stage'] === 'handle_bets') {
      if (notification.data.current['valid_until']) {
        // return `${notification.data.current.title} has been activated and valid upto ${this.datePipe.transform(new Date(notification.data.current['valid_until']), 'dd-MM-yyyy')}`;
        return this.translate.instant('notifications_text.bonus_activated_and_valid',{title:notification.data.current.title,valid_until:this.datePipe?.transform(new Date(notification.data.current['valid_until']), 'dd-MM-yyyy') || new Date(notification.data.current['valid_until']).toDateString()})
      }
      else {
        // return `${notification.data.current.title} has been activated`;
        return this.translate.instant('notifications_text.bonus_activated',{title:notification.data.current.title})
      }
    }
    else if (updatedobj['stage'] === 'wager_done') {
    //  return `You have been completed your wager for ${notification.data.current.title}`;
     return this.translate.instant('notifications_text.wager_done',{title:notification.data.current.title})
    }
  }
}


/**
 * Filter notification description for freespins
 * @param notification 
 */
  filterFreespinDescription(notification) {
    let updatedobj = this.difference(notification.data.current, notification.data.previous)
    if (updatedobj['stage']) {
      if (updatedobj['stage'] === 'canceled' || updatedobj['stage'] === 'expired' || updatedobj['stage'] === 'finished') {
        // return notification.data.current.title + " has been " + updatedobj['stage'];
        return this.translate.instant('notifications_text.freespins_expired',{title:notification.data.current.title,stage:updatedobj['stage']})
      }
      else if (updatedobj['stage'] === 'issued') {
        if (notification.data.current['activatable_until']) {
          // return notification.data.current.title + " has been issued and activatable upto " + this.datePipe.transform(new Date(notification.data.current['activatable_until']), 'dd-MM-yyyy');
          return this.translate.instant('notifications_text.freespins_issued_and_activatable',{title:notification.data.current.title,activatable_until:this.datePipe?.transform(new Date(notification.data.current['activatable_until']), 'dd-MM-yyyy') || new Date(notification.data.current['activatable_until']).toDateString()})
        }
        else {
          // return notification.data.current.title + " has been issued";
          return this.translate.instant('notifications_text.freespins_issued',{title:notification.data.current.title})

        }
      }
      else if (updatedobj['stage'] === 'activated') {
        if (notification.data.current['valid_until']) {
        //  return notification.data.current.title + " has been activated and valid upto " + this.datePipe.transform(new Date(notification.data.current['valid_until']), 'dd-MM-yyyy');
        return this.translate.instant('notifications_text.freespins_activated_and_valid',{title:notification.data.current.title,valid_until:this.datePipe?.transform(new Date(notification.data.current['valid_until']), 'dd-MM-yyyy') || new Date(notification.data.current['valid_until']).toDateString()})
        }
        else {
          // return notification.data.current.title + " has been activated and you have " + notification.data.current['freespins_total'] + " Freespins";
          return this.translate.instant('notifications_text.freespins_activated',{title:notification.data.current.title,freespins_total:notification.data.current['freespins_total']})
        }
      }
    }
    else if (updatedobj['freespins_performed']) {
      let remaining_spins = notification.data.current['freespins_total'] - notification.data.current['freespins_performed'];
      // return "You have " + remaining_spins + " Freespins left";
      return this.translate.instant('notifications_text.freespins_left',{remaining_spins:remaining_spins});
    }
  }

  /**
   * Filter out game limitis type notifications
   * @param notification 
   */
  filterGameLimits(notification) {
    switch(notification.data.reason) {
      case "game_forbidden_with_bonus":
        // return `${this.allGames[notification.data.game].title} has been blocked for bonus money`
        return this.translate.instant('notifications_text.game_forbidden_with_bonus',{game_title:this.allGames[notification.data.game].title});

      case "bonus_bet_limit_exceeded":
      return this.translate.instant('notifications_text.bonus_bet_limit_exceeded',{game_title:this.allGames[notification.data.game].title, amount:notification.data.amount_cents, limit:notification.data.limit_cents});
        // return `Your bonus bet limit has been exceeded for ${this.allGames[notification.data.game].title} with amount ${notification.data.amount_cents} having limit of ${notification.data.limit_cents}`

      case "bet_limit_exceeded-":
        return this.translate.instant('notifications_text.bonus_bet_limit_exceeded',{game_title:this.allGames[notification.data.game].title, amount:notification.data.amount_cents, limit:notification.data.limit_cents});
        // return `Your bet limit has been exceeded for ${this.allGames[notification.data.game].title} with amount ${notification.data.amount_cents} having limit of ${notification.data.limit_cents}`

      case "session_limit_exceeded":
        // return `Your session limit has been exceeded for ${this.allGames[notification.data.game].title}`
        return this.translate.instant('notifications_text.session_limit_exceeded',{game_title:this.allGames[notification.data.game].title})

      case "trigger_reality_check":
        return this.translate.instant('notifications_text.reality_check');
    }
  }

  getImage(notification) {
    switch(notification.title){
      case NOTIFICATION_TYPES.BONUS:
        return 'assets/img/bonus/offer_pic.svg';

      case NOTIFICATION_TYPES.FREESPINS:
        return 'assets/img/bonus/offer_pic.svg';

      case NOTIFICATION_TYPES.PAYMENT:
        if(notification.data.action=='deposit') {
          return 'assets/img/Notifications/Depositing money t&C_48px.svg';
        } else {
          return 'assets/img/Notifications/withdraw t&C_48px.svg';
        }

      case NOTIFICATION_TYPES.TOURNAMENT:
        return 'assets/img/icons/Tournaments.svg';

      case NOTIFICATION_TYPES.WAGER_DONE:
        return 'assets/img/bonus/offer_pic.svg';

      case NOTIFICATION_TYPES.WINNERS:
        return `${environment.imgBaseURL}/i/s3/${notification?.data?.game?.identifier}.png`;

      case NOTIFICATION_TYPES.GAME_LIMITS:
        return `${environment.imgBaseURL}/i/s3/${notification?.data?.game}.png`;

      case NOTIFICATION_TYPES.STATUS:
        return 'assets/img/Notifications/Loyalty program level up + bonus_48px.svg';

      default:
        return 'assets/img/Notifications/BOnus t&C _48px.svg';
    }

  }

}