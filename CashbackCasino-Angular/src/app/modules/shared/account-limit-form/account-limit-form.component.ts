import { Component, OnInit, Input, OnDestroy, Output, EventEmitter, SimpleChange, OnChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpService, AlertService } from 'src/app/core/services';
import { APIS } from 'src/app/common/constants';
import { Subscription, timer } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'account-limit-form',
  templateUrl: './account-limit-form.component.html',
  styleUrls: ['./account-limit-form.component.scss']
})
export class AccountLimitFormComponent implements OnInit,OnChanges, OnDestroy {
  form: FormGroup;
  @Input() label: string;
  @Input() payload: any;
  @Output() onSuccess = new EventEmitter();
  btn: string = "edit";
  currency: string;
  activeLimit: any;
  otherLimit: any;
  countDown: Subscription;
  timeOut: number;
  countDownString: string = "";
  constructor(
    private formBuilder: FormBuilder,
    private httpService: HttpService,
    private alertService: AlertService,
    private translate:TranslateService
  ) { }

  ngOnInit(): void {
    this.initLimitForm();
  }
  ngOnChanges(changes:{ [propName: string]: SimpleChange}){
    if( changes['payload'] && changes['payload'].previousValue && JSON.stringify(changes['payload'].previousValue) != JSON.stringify(changes['payload'].currentValue)) {
      this.initLimitForm();
    }
  }
  ngOnDestroy() {
    if(this.countDown) this.countDown.unsubscribe();
  }

  initLimitForm() {

    this.activeLimit = this.payload[0]; // this active limit
    if (this.payload.length > 1) {
      this.activeLimit = this.payload.find(p => p.status === 'active');
      this.otherLimit = this.payload.find(p => p.status !== 'active');
      if (this.otherLimit && this.otherLimit.confirm_until) {
        this.timeOut = Math.floor((new Date(this.otherLimit.confirm_until).getTime() - Date.now()) / 1000);

        this.countDown = timer(0, 1000).subscribe(() => {
          this.timeOut--;
          let day: number = Math.floor(this.timeOut / 86400);
          let hours: number = Math.floor((this.timeOut % 86400) / 3600);
          let minutes: number = Math.floor((this.timeOut % 3600) / 60);
          let seconds: number = Math.floor(this.timeOut % 60);

          this.countDownString = "";
          if (day) this.countDownString += day + "d ";
          if (day || hours) this.countDownString += ('00' + hours).slice(-2) + "h ";
          if (day || hours || minutes) this.countDownString += ('00' + minutes).slice(-2) + "m ";
          if (day || hours || minutes || seconds) this.countDownString += ('00' + seconds).slice(-2) + "s";
        });
      }
    }

    this.currency = this.activeLimit.accounts ? this.activeLimit.accounts[0].currency : this.activeLimit.currency;
    let amount = this.activeLimit.accounts ? this.activeLimit.accounts[0].amount_cents / 100 : '';
    if (!this.form) {
      this.form = this.formBuilder.group({
        amount_cents: [amount, [Validators.required, Validators.min(0), Validators.pattern('^[0-9]+(\.[0-9]{1,2})?$')]]
      });
    }
    else {
      this.form.controls.amount_cents.patchValue(amount);
    }
  }
  submitForm() {
    if (this.form.invalid) {
      return;
    }
    if(this.form.value.amount_cents>0){
    let sendData = {
      user_limit: {
        period: this.activeLimit.period,
        type: this.activeLimit.type,
        accounts: [{
          currency: this.currency,
          amount_cents: this.form.value.amount_cents * 100
        }]
      }
    };

    this.httpService.postData(APIS.USER_LIMITS, sendData).subscribe(resp => {
      this.onSuccess.emit();
      if(this.countDown) this.countDown.unsubscribe();
      this.btn = 'edit';
    }, error => {
    });
  } else {
    this.btn = 'edit';
    this.form.controls.amount_cents.setValue('');
  }

  }

  onKeydown(e) {
    ["e", "E", "+", "-"].includes(e.key) && e.preventDefault();
  }

  deleteLimit() {
    if (!this.otherLimit) {
      return;
    }
    this.httpService.deleteData(APIS.USER_LIMITS + "/" + this.otherLimit.id).subscribe(resp => {
      this.onSuccess.emit();
    }, error => {
      if (error.limit && error.limit.disable_impossible) {
        this.alertService.error(error.limit.disable_impossible);
      }
    })
  }

  getTranslatedText(text) {
    return this.translate.instant(text);
  }
  reset() {
    let amount = this.activeLimit.accounts ? this.activeLimit.accounts[0].amount_cents / 100 : '';
    this.form.controls.amount_cents.patchValue(amount);
    this.btn = 'edit';
  }
}