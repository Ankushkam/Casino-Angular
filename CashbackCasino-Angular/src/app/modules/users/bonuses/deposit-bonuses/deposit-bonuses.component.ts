import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { HttpService, AlertService, AuthService, ModalService, SharedService } from 'src/app/core/services';
import { APIS, USER_DETAILS } from 'src/app/common/constants';
import { Router } from '@angular/router';
import * as _ from 'lodash';
import { CurrencyConverterPipe } from 'src/app/core/pipes/currencyConverter.pipe';
import { CurrencySymbolPipe } from 'src/app/core/pipes/currencySymbol.pipe';
import { BonusFreespinsService } from 'src/app/core/services/bonus-freespins.service';
import { BonusPreviewService } from 'src/app/core/services/bonus-preview.service';

@Component({
  selector: 'app-deposit-bonuses',
  templateUrl: './deposit-bonuses.component.html',
  styleUrls: ['./deposit-bonuses.component.scss']
})
export class DepositBonusesComponent implements OnInit {


  currency;
  @Input() type;
  @Input() page;
  bonusTypes = [];
  allCurrencies = [];
  filteredBonuses = [];
  isRecieveBonuses = false;
  bonusGroups = [];
  selectedGroup;
  statuses = [];
  playerData;
  isLoggedIn: boolean;
  @Output() goTo = new EventEmitter();
  @Output() totalCount = new EventEmitter();

  @Input() fromWallet;
  hideMsg = false;
  constructor(private bonuspreview: BonusPreviewService, private sharedService:SharedService,public currencySymbol: CurrencySymbolPipe, private bonusService: BonusFreespinsService, private modalService: ModalService, public httpService: HttpService, public convertCurrency: CurrencyConverterPipe, public alertService: AlertService, public router: Router, public authService: AuthService) {
    this.errorHandler = this.errorHandler.bind(this);
  }

  ngOnInit(): void {
    this.hideMsg = false;

    if (this.fromWallet) {
      this.hideMsg = this.fromWallet
    }

    this.currency = this.authService.getUserData(USER_DETAILS.Currency) || 'EUR';
    let api;
    if (this.type == 'deposit') {
      api = APIS.BONUS_PREVIEW.DEPOSIT_BONUSES
    } else {
      api = APIS.BONUS_PREVIEW.REGISTRATION_BONUSES
    }
    this.httpService.getData(api).subscribe((bonuses) => {
      this.httpService.getData(APIS.STATUSES).subscribe(res => {
        this.statuses = res.body;
        this.bonusTypes = (bonuses || {}).body;
        this.bonuspreview.setBonusesAvailability(this.bonusTypes, { currency: 'EUR' });
        this.bonuspreview.setBonusesActivity(this.bonusTypes, { currency: 'EUR' });
        this.filterBonuses(bonuses.body)
      })
    })

    this.httpService.getData(APIS.PLAYER.DATA).subscribe((res) => {
      this.playerData = (res || {}).body;
      this.isRecieveBonuses = this.playerData?.can_issue_bonuses;


    });
    // this.httpService.getData(APIS.CURRENCIES).subscribe((res) => {
    //   this.allCurrencies = res.body;
    // });
    this.sharedService.isCurrenciesUpdated.subscribe((res)=>{
      this.allCurrencies=this.sharedService.allCurrencies;
  })


  }

  filterBonuses(bonusTypes) {
    this.totalCount.emit(this.bonusTypes.length);
    let allKeys, bonusData;
    bonusTypes.forEach((bonusType: any) => {
      bonusType.bonuses.forEach(bonus => {
        bonusData = {};
        allKeys = Object.keys(bonus);
        allKeys.forEach(key => {
          if (key == 'title' || key == 'type' || key == 'isAvailable' || key == 'isActive') {
            bonusData[key] = bonus[key];
          } else {
            bonus[key].forEach(field => {
              if (!bonusData[key]) {
                bonusData[key] = {};
              }
              bonusData[key][field.field] = this.filterByField(field, this.currency, this.allCurrencies);
            });
          }
        });
        if (bonusData.isAvailable) {
          this.filteredBonuses.push(bonusData);
        }
      });
    })
  }

  filterByField(item, currency, allCurrencies) {
    let localizedValue;
    switch (item.field) {
      case 'currencies':
      case 'deposit_payment_systems':
      case 'game_categories':
      case 'games':
        localizedValue = item.value.join(', ');
        break;
      case 'game_identifiers':
        localizedValue = _.uniq(_.map(item.value, 'title')).join(', ');
        break;
      case 'amount':
      case 'freespins_max_win':
      case 'max_win':
        localizedValue = item.value
          .filter((obj) => {
            if (currency) {
              return obj.currency === currency;
            }
          })
          .map((obj) => {
            return `${this.currencySymbol.transform(obj.currency)} ${this.getConvertedCurrency(obj.amount_cents, [obj.currency, allCurrencies])}`;
          })
          .join(', ');
        break;
      case 'bonus_amount':
      case 'bonus_bet_limits':
      case 'bonus_amount_max':
      case 'bonus_amount_min':
        if (item.value && item.value.percent) {
          localizedValue = item.value.percent + '%';
        }
        else if (item.value && item.value.default) {
          localizedValue = item.value.default
            .filter((obj) => {
              if (currency) {
                return obj.currency === currency;
              }
            })
            .map((obj) => {
              return `${this.currencySymbol.transform(obj.currency)} ${this.getConvertedCurrency(obj.amount_cents, [obj.currency, allCurrencies])}`;
            })
            .join(', ');
        }
        else {
          localizedValue = item.value
            .filter((obj) => {
              if (currency) {
                return obj.currency === currency;
              }
            })
            .map((obj) => {
              return `${this.currencySymbol.transform(obj.currency)} ${this.getConvertedCurrency(obj.amount_cents, [obj.currency, allCurrencies])}`;
            })
            .join(', ');
        }
        break;
      case 'groups':
        // groups = attr[:value].reject(&:blank?)
        localizedValue = item.value.map((groupId) => {
          let group = this.getStatusById(groupId);
          this.bonusGroups.push(group);
          return group ? group.id : '';
        }).join(', ');
        localizedValue = item.value;
        break;
      // case 'date_time':
      //     var from = item.value.from ? $filter('translate')('frontend.bonus_preview.values.date_time_date_inclusion.from', {value: item.value.from}) : '';
      //     var to = item.value.to ? $filter('translate')('frontend.bonus_preview.values.date_time_date_inclusion.to', {value: item.value.to}) : '';
      //     var time = item.value.time ? $filter('translate')('frontend.bonus_preview.values.date_time_date_inclusion.time', {value: item.value.time}) : '';
      //     var weekdays = item.value.on.length ? $filter('translate')('frontend.bonus_preview.values.date_time_date_inclusion.weekdays', {value: item.value.on.join(', ')}) : '';
      //     var tz = item.value.tz ? $filter('translate')('frontend.bonus_preview.values.date_time_date_inclusion.tz', {value: item.value.tz}) : '';

      //     localizedValue = $filter('translate')('frontend.bonus_preview.values.date_time_date_inclusion.full_message', {
      //         from: from,
      //         to: to,
      //         time: time,
      //         weekdays: weekdays,
      //         tz: tz
      //     });
      //     break;
      default:
        localizedValue = item.value;
        break;
    }
    return localizedValue;
  }

  getStatusById(id) {
    return this.statuses.find((item) => {
      return item.id === id;
    });
  }


  updateBonuses(event, bonus) {
    let groups = {};
    if (event.target.checked) {
      if (((this.playerData || {}).statuses || {}).length > 0) {
        groups['remove'] = [];
        let selectedGroup = this.playerData.statuses.find((group) => {
          let foundGroup = this.bonusGroups.find((records) => {
            return records.id == group.id
          })
          // return group.id==bonus.conditions.groups[0];
          return foundGroup ? true : false;
        })
        if (selectedGroup) {
          // groups['remove'].push(((this.playerData || {}).statuses[0] || {}).id);
          groups['remove'].push(selectedGroup.id);
        }
      }
      groups['add'] = [];
      groups['add'].push(bonus.conditions.groups[0]);
    } else {
      groups['remove'] = [];
      groups['remove'].push(bonus.conditions.groups[0]);
    }
    this.httpService.postData(APIS.PLAYER.GROUPS, { groups: groups }).subscribe((res) => {
      this.httpService.getData(APIS.PLAYER.DATA).subscribe((res) => {
        this.playerData = (res || {}).body;
      });
    }, this.errorHandler);
  }

  getMaxAmount(bonus) {
    let obj = bonus.bonuses[0].attributes[0].value.default.find(value => {
      return value.currency == this.currency;
    });
    if (obj) {
      return obj.amount_cents;
    }
    return bonus.bonuses[0].attributes[0].value.default[0]?.amount_cents;
  }

  getConvertedCurrency(value, currency) {
    return this.convertCurrency.transform(value, currency);
  }


  getValue(bonus) {
    if (bonus.conditions.groups) {
      if (this.playerData) {
        let status = (this.playerData || {}).statuses.find(status => {
          return status.id == bonus.conditions.groups[0]
        });
        if (status) {
          return true;
        }
      }
      return false;
    }
    return false;
  }


  recieveBonuses(event) {
    let status = event?.target?.checked;
    this.httpService.patchData(APIS.PLAYER.UPDATE_BONUS_SETTINGS, { "can_issue": !status }).subscribe((res) => {
      this.isRecieveBonuses = status?false:true;
      this.sharedService.hideTabs((this.isRecieveBonuses)?null:["loyalty_program"])
    })


  }

  // signUp() {
  //   this.modalService.openModal(RegisterComponent);
  //   this.goTo.emit('/');
  // }


  errorHandler(error) {
    let errors = Object.keys(error);
    errors.forEach(key => {
      let titles = Object.keys(error[key]);
      titles.forEach((err) => {
        this.alertService.error(`${(error[key][err])}`);
      })
    });
  }


}
