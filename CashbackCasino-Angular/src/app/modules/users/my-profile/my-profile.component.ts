import { Component, OnInit, HostListener, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService, AlertService, RealTimeService, SharedService } from 'src/app/core/services';
import { APIS, DEFAULT_VALUES } from 'src/app/common/constants';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import * as _ from 'lodash';
import { environment } from 'src/environments/environment';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.scss']
})
export class MyProfileComponent implements OnInit {
  goToDeposits;
  goToLimits;
  goToHistory;
  goToDocuments;
  bonusHistory;
  bonuses;
  limitsAdvancedMode: boolean;
  coolOffAdvancedMode: boolean;
  profileForm: FormGroup;
  limitForm: FormGroup;
  betsData=[];
  countries=[];
  promocodeMsg;
  closeModal: Boolean = false;
  @Input() profileEdit: boolean = false;
  show30:boolean=false;
  show60:boolean=false;
  show90:boolean=false;
  title: string = this.getTranslatedText('links_text.my_profile');
  accounts_types:any = ['deposit', 'loss', 'wager'];
  accounts_periods:any = ['day', 'week', 'month'];
  bonusHistoryStages = [ "lost", "canceled", "expired", "wager_done"];
  allCurrencies=[];
  limitData :any={};
  allLimits: any;
  transactionHistory=[];
  history=[];
  profile:any;
  activeTab;
  limitSuccess: boolean= false;
  realityLimitSuccess: boolean = false;
  timeOutLimitSuccess: boolean = false;
  selfExclusionLimitSuccess: boolean = false;
  fields: any;
  hide:any = {};
  currentRealityCheckTime: number;
  showSidebar:boolean;
  invalidDate = false;
  isEighteen = true;
  promocode;
  selfExclusionContent;
  realityCheckContent;
  depositLimitsContent;
  lossLimitsContent;
  wageringLimitsContent;
  sessionLimitsContent;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if(window.innerWidth <= DEFAULT_VALUES.MOBILE_SIZE && this.showSidebar == undefined){
      this.showSidebar =  true;
    }
    else if(window.innerWidth > DEFAULT_VALUES.MOBILE_SIZE && this.showSidebar != undefined){
      this.showSidebar = undefined;
    }
  }
  constructor(
    private formBuilder: FormBuilder,
    private httpService: HttpService,
    private alertService: AlertService,
    private activeModal: NgbActiveModal,
    private realTimeService: RealTimeService,
    private translate:TranslateService,
    private sharedService:SharedService
    ) { }

  ngOnInit(): void {
    if (window.innerWidth <= DEFAULT_VALUES.MOBILE_SIZE) {
      this.showSidebar = true;
    }
        // First we get the viewport height and we multiple it by 1% to get a value for a vh unit
        let vh = window.innerHeight * 0.01;
        // Then we set the value in the --vh custom property to the root of the document
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    this.initProfileForm();
    this.initLimitForm();
    this.subscribeRealTimeData();
  }

  initProfileForm(){
    this.httpService.getData(APIS.PLAYER.FIELDS).subscribe(resp => {
      this.fields = resp.body.fields.filter(f => resp.body.contexts.edition.includes(f.field));
      this.hide = {};
    });
    this.httpService.getData(APIS.PLAYER.DATA).subscribe(resp => {
      this.profile = resp.body;
      this.profileForm = this.formBuilder.group({
        first_name: [this.profile.first_name, [Validators.required]],
        last_name: [this.profile.last_name, [Validators.required]],
        email: [this.profile.email, [Validators.required, Validators.email]],
        mobile_phone: [this.profile.mobile_phone, [Validators.required ]],
        address: [this.profile.address, [Validators.required ]],
        postal_code: [this.profile.postal_code],
        country:[this.profile.country,Validators.required],
        gender:[this.profile.gender,Validators.required],
        date_of_birth:[this.profile.date_of_birth,Validators.required],
        city: [this.profile.city, [Validators.required ]],
        receive_sms_promos: [this.profile.receive_sms_promos, [Validators.required ]],
        receive_promos: [this.profile.receive_promos, [Validators.required ]],
        dob:this.formBuilder.group({
          dd:[this.getTwoDigitNumber(new Date(this.profile.date_of_birth).getUTCDate())],
          mm:[this.getTwoDigitNumber(new Date(this.profile.date_of_birth).getUTCMonth()+1)],
          yy:[new Date(this.profile.date_of_birth).getFullYear()]
        })
      });
      this.httpService.getData(APIS.PAYMENTS.HISTORY).subscribe((res)=>{
        this.transactionHistory=res.body.reverse();
        if(this.goToHistory){
          this.activeTab='history';
          this.getHistory('30')
        }
      })
      this.httpService.getData(APIS.PLAYER.BONUSES).subscribe((res)=>{
        this.bonuses=res.body.reverse();
        this.filterBonusHistory(this.bonuses)
      });
      // this.httpService.getData(APIS.CURRENCIES).subscribe((res)=>{
      //   this.allCurrencies=res.body;
      // });
      this.sharedService.isCurrenciesUpdated.subscribe((res)=>{
        this.allCurrencies=this.sharedService.allCurrencies;
    })
      this.httpService.getData(APIS.PLAYER.GAMES).subscribe((res)=>{
        this.betsData=res.body;
        // this.betsData=GAMES_DATA;
      })
      this.httpService.getData(APIS.COUNTRY_LIST).subscribe((res)=>{
        this.countries=res.body;
      });
      this.initAccountLimitData();
    });
    this.getSnippetsData();
  }

  getImageURL(identifier: string) {
    return `${environment.imgBaseURL}/i/s3/${identifier}.png`;
  }

  getSnippetsData(){
    this.sharedService.snippets.subscribe((res)=>{
      if(res){
        this.selfExclusionContent=res.find(snippet => snippet.id == "self-exclusion")?.content || "";
        this.realityCheckContent=res.find(snippet => snippet.id == "reality-check")?.content || "";
      }
    })
  }


  checkField(field){
    let f = this.fields.find(f => f.field == field);
    if(f){
      if( f.once_set && ( !this.profile[field] || this.profile[field] == "")){
         return false
      }
      else{
        return f.once_set;
      }
    }
    else{
      this.hide[field] = true;
      return false;
    }
  }

  getGender(gender){
    if(gender=='f'){
      return this.translate.instant('forms.label.female');
    } else if(gender=='m'){
      return this.translate.instant('forms.label.male')
    }
  }

  filterBonusHistory(bonuses) {
    this.bonuses=_.filter(bonuses, (bonus)=> {
      return this.bonusHistoryStages.indexOf(bonus.stage) >= 0
    });
    this.activeTab='bonus';
    this.getHistory('30');
  }

  onRecieptTabChange() {
  }

  getHistory(days) {
    let date;
    if(days=='30') {
      this.show30=true;
      this.show60=this.show90=false;
      date=moment().subtract(30, 'days');
    }
    else if(days=='60'){
      this.show60=true;
      this.show30=this.show90=false;
      date=moment().subtract(60, 'days');
    } 
    else if(days=='90') {
      this.show90=true;
      this.show30=this.show60=false;
      date=moment().subtract(90, 'days');
    }
    if(this.activeTab=="history") {
    this.history=this.transactionHistory.filter((res)=>{
      let givenDate= moment(new Date(res.created_at));
      return givenDate.isAfter(date);
    });
  } 
  if(this.activeTab=="bonus") {
    this.bonusHistory=this.bonuses.filter((res)=>{
      let givenDate= moment(new Date(res.created_at));
      return givenDate.isAfter(date);
    });
  }
  if(this.activeTab=='receipts') {

  }
  }

  updateProfile() {
    this.profileEdit=false;
      this.httpService.getData(APIS.PLAYER.DATA).subscribe(resp => {
        this.profile = resp.body;
        this.profileForm.controls.email.setValue(this.profile?.email);
        this.profileForm.controls.mobile_phone.setValue(this.profile?.mobile_phone);
        this.profileForm.controls.address.setValue(this.profile?.address);
        this.profileForm.controls.postal_code.setValue(this.profile?.postal_code);
        this.profileForm.controls.city.setValue(this.profile?.city);
        this.profileForm.controls.receive_sms_promos.setValue(this.profile?.receive_sms_promos);
        this.profileForm.controls.receive_promos.setValue(this.profile?.receive_promos);
        });
  }

  advancedMode(event,type){
      if(event.target.checked){
        if(type=='limit')
        this.limitsAdvancedMode=true;
        if(type=='coolOff')
        this.coolOffAdvancedMode=true;
      } else {
        this.coolOffAdvancedMode=false;
        this.limitsAdvancedMode=false;
      }
  }

  changeTab($event, customTitle?){
    switch ($event.target.hash) {
      case '#nav-exclusion': this.updateFormPeriodValue('selfexclusion'); break;
      case '#nav-timeout': this.updateFormPeriodValue('coolingoff'); break;
      case '#nav-reality': this.updateFormPeriodValue('reality_check'); break;
      case '#nav-history': this.activeTab='history'; break;
      case '#nav-receipt': this.activeTab='receipts'; break;
    }
    this.limitSuccess = false;
    this.title = customTitle ? customTitle : $event.target.text;
    if(typeof this.showSidebar === "boolean"){
      this.showSidebar = false;
    }
    this.getHistory('30');
  }

  applyPromocode() {
    var data = { "coupon_code": this.promocode }
    this.httpService.postData(`${APIS.BONUS_PREVIEW.ACTIVATE_COUPON}`, data).subscribe((couponDetails: any) => {
      if (couponDetails.status) {
        this.promocodeMsg = couponDetails.status.split('_').join(' ');
      }
    });

  }

  updateFormPeriodValue(limitType) {
    if(this.allLimits){
      let limit = this.allLimits.find(obj => obj.type == limitType);
      if(limit){
        this.limitForm.controls.period.patchValue(limit.period);
        if(limitType == "reality_check"){
          this.currentRealityCheckTime = limit.period;
        }
      }
      else{
        this.limitForm.controls.period.patchValue('');
      }
    }
  }
  close(value?) {
    if( !this.profileEdit || this.limitSuccess){
      this.activeModal.close();
    }
    else{
      this.closeModal = !this.closeModal;
    }
  }

  changeReceiptsTab(tab) {
    this.activeTab=tab;
    this.getHistory('30');
  }

  getStatus(status, finishedAt) {
    if(!status && finishedAt) {
      return this.translate.instant('text.discarded');
    }
    else if(!status && !finishedAt) {
      return this.translate.instant('text.pending')
    }
    else {
      return this.translate.instant('text.completed')
    }
  }

  initAccountLimitData(){
    this.httpService.getData(APIS.USER_LIMITS).subscribe(resp => {
      this.allLimits = resp.body;
      /** --set initial data for deposit, loss and wager limit */
      this.accounts_types.forEach(type => {
        this.accounts_periods.forEach(period => {
          if(!this.limitData[type]) this.limitData[type] = {}; 
          this.limitData[type][period] = resp.body.filter(obj => obj.period == period && obj.type == type);
          if( !this.limitData[type][period].length){
            this.limitData[type][period] = [{ type: type, period: period, currency: this.profile.currency }];
          }
        });
      });
    });
  }

  initLimitForm() {
    this.limitForm = this.formBuilder.group({
      period : ['', [Validators.required ]]
    });
  }

  get formControls() { return this.profileForm.controls; };

  changePeriod(event){
    this.limitForm.controls.period.patchValue(event.target.value);
  }

  submitProfile(){
    if (this.profileForm.invalid) {
      return;
    }
    /** -- check is user change form manually or not */
    let notEditableField = this.fields.filter(f => f.once_set && this.profile[f.field] && this.profile[f.field] != "" && this.profileForm.value[f.field]).find(f => this.profile[f.field] != this.profileForm.value[f.field]);
    if(notEditableField){
      return;
    }
    let data=this.profileForm.value;
    // data['date_of_birth']=new Date(Date.UTC(this.profileForm.value?.dob.yy, this.profileForm.value?.dob.mm-1,this.profileForm.value?.dob.dd,0,0,0))
    data['date_of_birth']=`${this.profileForm.value?.dob.yy}-${this.profileForm.value?.dob.mm}-${this.profileForm.value?.dob.dd}`
    delete data['dob'];
    let sendData = {context: "edition", player: this.profileForm.value};
    this.httpService.putData(APIS.PLAYER.DATA, sendData).subscribe(resp => {
      this.httpService.getData(APIS.PLAYER.DATA).subscribe(resp => {
        this.profile = resp.body;
      });
      this.profileEdit = false;
    }, error =>{
        if(error.base && error.base.update_was_not_performed){
          this.alertService.error(error.base.update_was_not_performed);
        }
    });
  }

  getTranslatedText(text) {
    return this.translate.instant(text);

  }

  getTranslatedPayment(text) {
    if(text=='deposit') {
      return this.translate.instant('title.deposit');
    } else if(text=='withdraw') {
      return this.translate.instant('title.withdrawal');
    }
    else {
      return text;
    }
  }

  submitLimitForm(limitType) {
    if (this.limitForm.invalid) {
      return;
    }
    let sendData = { user_limit: {
      period: this.limitForm.value.period,
      type: limitType
    }};
    this.httpService.postData(APIS.USER_LIMITS,sendData).subscribe(resp => {
      this.initAccountLimitData();
      if(limitType == "reality_check"){
        this.currentRealityCheckTime = this.limitForm.value.period;
      }
      if(limitType=='selfexclusion'){
        this.selfExclusionLimitSuccess=true;
      }
      if(limitType=='coolingoff'){
        this.timeOutLimitSuccess=true;
      }
      this.limitSuccess = true;
    }, error => {
      if(error.base && error.base.can_not_change_limit_expires_less_than_7_days){
        this.alertService.error(error.base.can_not_change_limit_expires_less_than_7_days);
      }
    })
  }
  subscribeRealTimeData(){
    this.realTimeService.subscribe('game_limits#', (resp) => {
      if (resp.data.reason == 'trigger_reality_check') {
      } else {
      }
    });
    this.realTimeService.subscribe('bonuses_changes#', (resp) => {
      console.log("Real time channel bonuses_changes", resp);
    });
    this.realTimeService.subscribe('payments_changes#', (resp) => {
      console.log("Real time channel payments_changes", resp);
    });
  }

  onBackspaceKeydown(event: any, control, prevref) {
    let key = event.keyCode || event.charCode;
    if (key == 8 || key == 46) {
      if ((control == 'mm' && !this.dobControls.mm.value) || (control == 'yy' && !this.dobControls.yy.value)) {
        prevref.focus();
      }
    }
  }

  /**
   * Custom filter for DOB validations
   * @param event 
   * @param maxlength 
   * @param minlength 
   * @param control 
   * @param nextref 
   * @param maxValue 
   */
  dateInputFilter(event: any, maxlength?, minlength?, control?, nextref?, maxValue?, nextControl?) {
    const pattern = /^[\d./-]*$/;
    const inputChar = String.fromCharCode(event.charCode);
    if (!pattern.test(inputChar)) {
      event.preventDefault();
      return;
    } else {
      const value = ((event.target.value) + (inputChar));
      const length = value.length;

      // Handling year input
      if (control == 'yy') {
        if (!pattern.test(inputChar) || length > maxlength) {
          event.preventDefault();
        }
        if (length == minlength || length == maxlength) {
          this.validateYear(value, this.getTwoDigitNumber(this.dobControls.mm.value), this.getTwoDigitNumber(this.dobControls.dd.value), length);
        }
      } else {
        if (!pattern.test(inputChar) || +value > maxValue || (value)=='00' || value.length>maxlength) {
          event.preventDefault();
          if (+value > maxValue || value=='00') {
            if (length <= maxlength) {
              this.dobControls[control].setValue(this.getTwoDigitNumber(value));
              this.invalidDate = true;
              return
            }
          }
        } else {
          this.invalidDate = false;
        }
        if (this.profileForm.controls['dob'].valid && this.dobControls.yy.value) {
          let year = this.dobControls.yy.value;
          let yearLength = String(this.dobControls.yy.value).length;
          if (yearLength == 1) {
            year = this.getTwoDigitNumber(year);
            yearLength = 2;
          }
          if (control == 'dd') {
            this.validateYear(year, this.getTwoDigitNumber(this.dobControls.mm.value), value, yearLength);
          }
          if (control == 'mm') {
            this.validateYear(year, value, this.getTwoDigitNumber(this.dobControls.dd.value), yearLength);
          }
        }
      }
      if (length == maxlength) {
        if (nextref) {
          this.profileForm.get('dob').get(nextControl).enable();
          nextref.focus();
        }
      }
    }
  };

  /**
   *  Returns 2 digit number by appending 0 at starting to single digit number
   * @param d 
   */
  getTwoDigitNumber(d) {
    return (+d < 10 && String(d).length == 1 ? '0' : '') + String(d);
  }

  /**
   * Custom validator for validating date and age based on entered date
   * @param year 
   * @param month 
   * @param day 
   * @param digits 
   */
  validateYear(year, month, day, digits) {
    let date;
    let string = `${day}/${month}/${year}`;
    if (digits == 2) {
      date = moment(string, "DD/MM/YY").format("YYYY/MM/DD h:mm:ss A");
    } else {
      date = moment(string, "DD/MM/YYYY").format("YYYY/MM/DD h:mm:ss A");
    }
    if (date !== "Invalid date") {
      this.invalidDate = false;
      let minDOB = new Date();
      let today = new Date();
      minDOB.setFullYear(minDOB.getFullYear() - 18);
      let myDOB = new Date(date);
      if (today < myDOB) {
        myDOB.setFullYear(myDOB.getFullYear() - 100);
      }
      this.isEighteen = minDOB >= myDOB

    } else {
      this.invalidDate = true;
    }
  }

  get dobControls() {
    return this.profileForm['controls']['dob']['controls'];
  }
}