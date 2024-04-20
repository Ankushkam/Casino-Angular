import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { RealTimeService } from './real-time.service';
import { APIS } from 'src/app/common/constants';
import { NotificationService } from './notification.service';
import { BehaviorSubject } from 'rxjs';
@Injectable({
    providedIn: 'root'
  })
  export class PaymentsService {

    paymentsData= new BehaviorSubject(null);
      constructor(private httpService:HttpService, private realTimeService:RealTimeService,private notificationService:NotificationService) {
      }

    fetchPaymentHistory() {
        this.httpService.getData(APIS.PAYMENTS.HISTORY).subscribe(result => {
            this.paymentsData.next(result.body);
        });
    }

    subscribeRealTimeData() {
        this.realTimeService.subscribe('payments_changes#', (resp) => {
            console.log("Real time channel payments_changes", resp);
            this.onPaymentChange(resp.data);
        });
    }

    onPaymentChange(updatedPayments) {
        this.notificationService.onPaymentAdded("payments",updatedPayments);
    }

    initSubscriptions() {
      this.fetchPaymentHistory();
      this.subscribeRealTimeData();
    }
  }