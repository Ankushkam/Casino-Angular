import { Subject, BehaviorSubject, forkJoin } from 'rxjs';
import { Injectable } from '@angular/core';
import { APIS } from 'src/app/common/constants';
import { HttpService } from './http.service';
import { RestrictionsService } from './restrictions.service';

@Injectable({
  providedIn: 'root'
})
export class HeaderService {
  show = false;
  // toggleHeader = new Subject();
  toggle = new Subject();
  winnerList = new BehaviorSubject(null);
  headerData = new BehaviorSubject(null);
  userData = new BehaviorSubject(null);
  isUpdateHeader = new BehaviorSubject(false);
  isUpdateAccount = new BehaviorSubject(false);
  headerAmountDataUpdate = new BehaviorSubject(null);

  constructor(private httpService: HttpService,private restrictionService:RestrictionsService) { }

  toggleSideBar() {
    this.show = !this.show;
    this.toggle.next(this.show);
  }

  updateList() {
    this.winnerList.next(true);
  }

  // toggleHeaderBar(show: boolean) {
  //   this.toggleHeader.next(show);
  // }
  allCurrencies;
  fetchData() {
    let apis = [
      this.httpService.getData(APIS.CURRENCIES),
      this.httpService.getData(APIS.PLAYER.ACCOUNTS),
      this.httpService.getData(APIS.PLAYER.DATA)
    ]

    forkJoin(apis).subscribe((res) => {
      this.headerData.next({ currencies: this.restrictionService.restrictUserCurrencies(res[0].body,this.restrictionService.currencies), playerAccounts: res[1].body });
      this.userData.next({ currencies: res[0].body, playerAccounts: res[1].body, playerData: res[2].body })
      this.allCurrencies = res[0].body;
    })
  }

  getPlayerData() {
    if (this.userData.value) {
      return this.userData.value;
    }
  }

  updateHeader() {
    this.isUpdateHeader.next(true);
  }

  headerBalanceUpdate(account) {
    this.headerData.next({ currencies: this.allCurrencies, playerAccounts: account })
  }

  newAccountAdded(account) {
    this.isUpdateAccount.next(true);
  }

}
