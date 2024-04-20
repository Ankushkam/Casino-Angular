import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { NotificationFilterService } from './notification-centre-filter.service';
import * as _ from 'lodash';
import { NOTIFICATION_TYPES } from 'src/app/common/constants';
import { ModalService } from './modal.service';
import { RealityCheckComponent } from 'src/app/modules/shared/reality-check/reality-check.component';
import { HttpService } from 'src/app/core/services';
import { APIS } from 'src/app/common/constants';

class Message {
  data;
  type;
  event;
  markAsRead;
  constructor(data, type, event, markAsRead) {
    this.data = data;
    this.type = type;
    this.event = event;
    this.markAsRead = markAsRead;
  }
}
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  notificationsList = new BehaviorSubject(null);
  allNotifications;
  newNotificationsCount = new BehaviorSubject(0);
  newlyAddedBonuses = [];
  NEWLY_ADDED_BONUSES_TIMEOUT = 500;
  NOTIFICATION_TYPES = NOTIFICATION_TYPES;
  constructor(private notificationFilterService: NotificationFilterService, private modalService: ModalService, private httpService: HttpService) {

  }

  /**
  * Add new freespins message
  * @param {object} event - Event data
  * @param {object} data - Message data
  */
  onFreespinsAdded(event, data) {
    this.addCard(data, this.NOTIFICATION_TYPES.FREESPINS, "added");
  }

  /**
   * Add freespins (depends on filter)
   * @param {object} event - Event data
   * @param {object} data - Message data
   */
  onFreespinsGot(event, data) {
    // cancelFrispinsRefresh();
    data.filter(this.notificationFilterService.isFreespinNeeded)
      .forEach((freespinBonus) => {
        this.addCard(freespinBonus, this.NOTIFICATION_TYPES.FREESPINS, true);
      });
  }

  /**
   * Add new bonus message
   * @param {object} event - Event data
   * @param {object} data - Message data
  */
  onBonusAdded(event, data) {
    this.addCard(data, this.NOTIFICATION_TYPES.BONUS, "added");
  }

  /**
   * Add bonuses (depends on filter)
   * @param {object} event - Event data
   * @param {object} data - Message data
  */
  onBonusesGot(event, data) {
    // cancelBonusesRefresh();
    data.filter(this.notificationFilterService.isBonusNeeded)
      .forEach((bonus) => {
        this.addCard(bonus, this.NOTIFICATION_TYPES.BONUS, true);
      });
  }

  /**
   * Add payments (depends on filter)
   * @param {object} event - Event data
   * @param {object} data - Message data
  */
  onPaymentsGot(event, data) {
    // cancelPlayerPaymentsRefresh();

    [data].filter(this.notificationFilterService.isPaymentNeeded)
      .forEach((payment) => {
        this.addCard(payment, this.NOTIFICATION_TYPES.PAYMENT, true);
      });
  }

  /**
    * Update freespin message
    * @param {object} event - Event data
    * @param {object} data - Message data
   */
  onFreespinsUpdated(event, data) {
    this.addCard(data, this.NOTIFICATION_TYPES.FREESPINS, 'updated');
  }

  /**
   * Update bonus message
   * @param {object} event - Event data
   * @param {object} data - Message data
   */
  onBonusUpdated(event, data) {
    this.addCard(data, this.NOTIFICATION_TYPES.BONUS, 'updated');

    if (data.current.stage === this.NOTIFICATION_TYPES.WAGER_DONE) {
      this.addCard(data, this.NOTIFICATION_TYPES.WAGER_DONE, "updated");
    }
  }

  /**
   * Add new notification to existing list
   * @param data - notification data
   * @param type - notification type
   * @param markAsRead  - message marked as read info
   */
  addCard(data, type, event, markAsRead = false) {
    let currentValue = [];
    if (this.notificationsList.value) {
      currentValue = [...this.notificationsList.value];
    }
    let existingValue = currentValue.find((obj) => {
      return _.isEqual(obj.data, data);
    });
    if (!existingValue) {
      currentValue.push(new Message(data, type, event, markAsRead));
      this.notificationsList.next(null);
      this.notificationsList.next(currentValue);
    }
  }

  /**
   * add new payment message
   * @param {object} event - Event data
   * @param {object} data - Message data
  */
  onPaymentAdded(event, data) {
    this.addCard(data, this.NOTIFICATION_TYPES.PAYMENT, "added");
  }

  /**
   * Add new status change notification
   * @param {object} event - Event data
   * @param {object} data - notification data
   */
  onStatusChanged(event, data) {
    this.addCard(data, this.NOTIFICATION_TYPES.STATUS, "added");
  }

  groupChanges(event, data) {
    this.addCard(data, this.NOTIFICATION_TYPES.GROUPS, "updated");
  }

  /**
   * On Tournament changes
   */
  onTournamentAdded(event, data) {
    data.forEach((record) => {
      this.addCard(record, this.NOTIFICATION_TYPES.TOURNAMENT, "added");
    });
  }

  latestWinner(event, data) {
    this.addCard(data, this.NOTIFICATION_TYPES.WINNERS, "winner");

  }
  realityCheckData;
  gameLimits(event, data) {
    if (data.reason == "trigger_reality_check") {
      this.httpService.getData(APIS.PLAYER.REALITY_CHECK).subscribe((res) => {
        this.realityCheckData = res.body;
        if (Object.keys(this.realityCheckData).length > 0) {
          this.modalService.openModal(RealityCheckComponent, { "realityCheck": this.realityCheckData });
        }
        //   {
        //     "activity_sum": {
        //       "NOK":"700.0"
        //     },
        //   "wager_sum": {
        //     "NOK":"-1100.0"
        //   },
        //   "period":{
        //     "from":"2020-11-27T12:47:49.000Z",
        //     "to":"2020-11-27T13:18:19.659Z"
        //   }
        // }

      })
    } else {
      this.addCard(data, this.NOTIFICATION_TYPES.GAME_LIMITS, "winner")
    }
  }

  markAsRead(item, index) {
    let currentData = this.notificationsList.value;
    currentData[index].markAsRead = true;
    this.notificationsList.next(currentData);
  }

  /**
   * Mark as read for all notifications
   */
  readAll() {
    let currentData = this.notificationsList.value;
    currentData = currentData.forEach((message) => {
      message['markAsRead'] = true;
    });
    this.notificationsList.next(currentData);
  }

  /**
   * Empty notifications list
   */
  clear() {
    this.notificationsList.next(null);
  }

}