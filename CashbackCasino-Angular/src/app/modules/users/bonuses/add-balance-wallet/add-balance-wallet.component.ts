import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertService, HttpService } from 'src/app/core/services';
import { APIS } from 'src/app/common/constants';
import { HeaderService } from '../../../../core/services/header.service';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-add-balance-wallet',
  templateUrl: './add-balance-wallet.component.html',
  styleUrls: ['./add-balance-wallet.component.scss']
})
export class AddBalanceWalletComponent implements OnInit {

  allCurrencies;
  userCurrencies = [];
  existingAccounts;
  // selectedCurrency;


  constructor(private activeModal: NgbActiveModal, private httpService: HttpService, private alertService: AlertService, private headerService: HeaderService, private translate: TranslateService) {
    this.errorHandler = this.errorHandler.bind(this);
  }

  ngOnInit(): void {
    // console.log("this.allCurrencies: ", this.allCurrencies)
    // console.log("this.allCurrencies: ", this.allCurrencies[0])
    // console.log("this.allCurrencies: ", this.allCurrencies[0].code)
    // console.log("this.existingAccounts: ", this.existingAccounts)
    // console.log("this.existingAccounts: ", this.existingAccounts[0].currency)

    this.userCurrencies = [];
    // this.userCurrencies = this.allCurrencies;

    for (var i = 0; i < this.allCurrencies.length; i++) {
      for (var j = 0; j < this.existingAccounts.length; j++) {
        if (this.allCurrencies[i].code == this.existingAccounts[j].currency) {
          this.allCurrencies.splice(i, 1);
        }
        // else {
        //   this.userCurrencies.push(this.allCurrencies[i]);
        // }
      }
    }
    this.userCurrencies = this.allCurrencies

  }

  @Output() response = new EventEmitter<boolean>();
  // @Output() selectedCurrency = new EventEmitter<boolean>();

  errorHandler(error) {
    let errors = Object.keys(error);
    errors.forEach(key => {
      let titles = Object.keys(error[key]);
      titles.forEach((err) => {
        this.alertService.error(`${key} ${(error[key][err])}`);
      })
    });
  }

  // close(value) {
  //   console.log("close modal", value);
  //   if (value == 'yes') {
  //     this.activeModal.close();
  //   }
  //   else {
  //     this.response.emit(false);
  //   }
  // }

  selectedCurrencyCode;
  selectedCurrency(currency) {
    this.selectedCurrencyCode = currency.code;

  }

  addCurrency() {

    var data = { "currency": this.selectedCurrencyCode }
    this.httpService.postData(`${APIS.PLAYER.ACCOUNTS}`, data).subscribe((accountDetails: any) => {
      this.headerService.newAccountAdded(data);
    }, this.errorHandler);
    // this.selectedCurrency.emit(currency);
    this.activeModal.close('update accounts');
  }

  close() {
    this.activeModal.close('update accounts');
  }

}


