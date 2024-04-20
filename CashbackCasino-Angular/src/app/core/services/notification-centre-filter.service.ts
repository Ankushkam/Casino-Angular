import { Injectable } from '@angular/core';
@Injectable({
    providedIn: 'root'
  })
  export class NotificationFilterService {
      constructor() {}
    isFreespinNeeded(item) {
        return item.activatable && item.stage == 'issued';
    }

    isBonusNeeded(item) {
        return item.activatable && item.stage === 'issued';
    }

    isPaymentNeeded(item) {
        return false;
    }
  }