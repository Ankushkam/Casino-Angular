import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertService, AuthService, HttpService, ModalService, SharedService } from 'src/app/core/services';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { APIS } from 'src/app/common/constants';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { RegisterModel } from 'src/app/core/models/register.model';
import * as _ from 'lodash';
import { environment } from 'src/environments/environment';
import * as moment from 'moment';
import { Meta } from '@angular/platform-browser';
import { CountryISO, SearchCountryField } from 'ngx-intl-tel-input';
import { HeaderService } from 'src/app/core/services/header.service';

@Component({
  selector: 'app-updateterms',
  templateUrl: './updateterms.component.html',
  styleUrls: ['./updateterms.component.scss']
})
export class UpdatetermsComponent implements OnInit {

  constructor(private activeModal: NgbActiveModal,private headerService:HeaderService,private metaService:Meta,private sharedService:SharedService,private modalservice:ModalService,private fb:FormBuilder, private alertService: AlertService, private authService: AuthService, private router: Router, private translate: TranslateService, private httpService: HttpService) {
    this.errorHandler = this.errorHandler.bind(this);
  }

  data;
  keyCount
  content;
  titleService;
  playerData;
  step;
  group={};
  phoneNumber;
  form:FormGroup;
  isPNPAllowed:boolean;
  termsAcceptance:boolean;
  missingFields=[];
  gtagKey;
  currentIP;
  selectedISO='in';


  separateDialCode = true;
	SearchCountryField = SearchCountryField;
	CountryISO = CountryISO;
	preferredCountries: CountryISO[] = [CountryISO.UnitedStates, CountryISO.UnitedKingdom];
  phoneForm:FormGroup;
  ngOnInit(): void {
    this.sharedService.currentIP.subscribe((res)=>{
      this.currentIP=res?.country_code || 'se';
      this.selectedISO=String(this.currentIP).toLowerCase()
    })
    

    if(!this.step){
      this.step=0;
    }
    this.httpService.getData('/api/auth_providers').subscribe((res)=>{
      this.isPNPAllowed=(res?.body?.type=='pay_n_play')? true:false;
      if(this.isPNPAllowed) {
      this.gtagKey=environment.gtagKeyFi;
      this.addGtagScript();
      }
    })
    // this.sharedService.pnpAlowed.subscribe(res=>{
    //   this.isPNPAllowed=res;
    //   if(this.isPNPAllowed){
    //   this.gtagKey=environment.gtagKeyFi;
    //   this.addGtagScript();
    //   }
    // });
 

    if(this.step!==2){
      let termsAcceptanceField=this.playerData?.auth_fields_missed?.find((field)=>{return field=='terms_acceptance'});
    this.missingFields = this.playerData?.auth_fields_missed;
  //   if(this.isPNPAllowed){
  //   let emailIndex=this.missingFields.findIndex((res)=>{ return res=='email'})
  //   if(emailIndex>-1){
  //   this.missingFields.splice(emailIndex, 0, "phoneNumber");
  //   }
  // }
    if (termsAcceptanceField) {
      this.termsAcceptance = true;
      this.httpService.getData(`${APIS.CMS.PAGES}/terms-and-conditions`).subscribe(res => {
        this.data = res.body;
        this.content = this.data.content;
        if (this.data.blocks) {
          // this.titleService.setTitle(this.data.blocks.title || "");
          this.metaService.updateTag( { name: 'keywords', content: this.data.blocks.keywords || "Cashback Casino" })
          this.metaService.updateTag( { name: 'description', content: this.data.blocks.description || "Cashback Casino" })
        }
      });
    }
  }
  this.initForm();

  }

  initForm() {
    // this.form=this.fb.group({
    //   email: [this.authService.getUserData(USER_DETAILS.Email), Validators.required],
    //   terms_acceptance: ['']
    // })
    if(this.step!==2){
    this.form=this.buildForm();
    this.keyCount=Object.keys(this.form.controls)?.length;
    }
    this.phoneForm= this.fb.group({
      mobile_phone:['', Validators.required],
      receive_sms_promos:[this.playerData?.receive_sms_promos],
      receive_promos:[this.playerData?.receive_promos]
    })
  }

    /**
   * Create form dynamically with validators
   */
  buildForm() {
    if(this.missingFields?.length>0) {
    this.missingFields.forEach((item, i) => {
        this.group[item] = new FormControl('', Validators.required);
    })
    return new FormGroup(this.group)
  }
  }

  nextStep(){
    this.step=this.step+1;
  }

  addGtagScript() {
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + this.gtagKey;
    document.head.prepend(script);
  }


  errorHandler(error) {
    let errors = Object.keys(error);
    errors.forEach(key => {
      let titles = Object.keys(error[key]);
      titles.forEach((err) => {
        this.alertService.error(`${key}${(error[key][err])}`);
      })
    });
  }

  accept() {
    // this.form.controls.terms_acceptance.setValue(true);
    let playerData = {
      "user":
      {
        // "email": this.authService.getUserData(USER_DETAILS.Email),
        "profile_attributes": {
          "terms_acceptance": true
        }
      }
    }
    // let playerData=new RegisterModel(this.form.value);
    // playerData=_.pickBy(playerData, val => ![null, undefined, ''].includes(val));
    this.authService.updatePlayer(playerData).subscribe((res) => {
      this.authService.saveUserData(res);
      // if(res){

      // }
    })

    this.activeModal.close('yes');
  }
  continue() {
    let playerData;
    if(this.isPNPAllowed){
      playerData = {
        "user":
        {
          "email": this.form.controls.email.value,
          "terms_acceptance": this.form.controls.terms_acceptance.value,
          "profile_attributes": {
            "mobile_phone":this.form.controls.phoneNumber.value
          }
        }
      }
    } else{
    playerData=new RegisterModel(this.form.value,'',moment);
    playerData=_.pickBy(playerData, val => ![null, undefined, '','undefined'].includes(val));
    playerData=this.removeEmpty(playerData);
    }
    this.authService.updatePlayer(playerData).subscribe((res:any) => {
      // if(!res?.confirmed_at) {
      //   this.nextStep();
      //   this.authService.logout();
      // }
      this.authService.saveUserData(res);
      this.headerService.fetchData();
      this.headerService.isUpdateAccount.next(true);
      if(res?.auth_fields_missed?.length==0 && !res?.mobile_phone){
        this.step=2;
      } else {
        this.activeModal.close();
      }
    })
  }

  removeEmpty(obj) {
    let finalObj={};
    Object.keys(obj).forEach((key) => {
        if (obj[key] && typeof obj[key] === 'object' && key!=="date_of_birth") {
            const nestedObj = this.removeEmpty(obj[key]);
            if (Object.keys(nestedObj)?.length) {
                finalObj[key] = nestedObj;
            }
        } else if (obj[key] !== '' && obj[key] !== undefined && obj[key] !== null) {
            finalObj[key] = obj[key];
        }
    });
    return finalObj;
}

  reject() {
    this.router.navigate(['/', 'payment-methods']).then(nav => {
      this.activeModal.close('yes');
      console.log("success: ", nav); // true if navigation is successful
    }, err => {
      console.log("err: ", err) // when there's an error
    });

  }

  updateContactNumber() {
    let that=this;
    let playerData={}
    if(that.phoneForm.value){
      let phoneNumber=that.phoneForm?.value?.mobile_phone?.e164Number || that.phoneForm?.value?.mobile_phone?.number;
        // playerData = {
        //   "mobile_phone":phoneNumber
        // }
        playerData=this.phoneForm.value;
        playerData['mobile_phone']=phoneNumber;
        
        that.httpService.putData(APIS.PLAYER.DATA,{context: "edition", player: playerData}).subscribe((res:any) => {
          // this.authService.saveUserData(res);
          that.close()
          that.router.navigate(['/']);
        },(error)=>{
          this.getErrors(error)
        });
      } 

  }

    /**
   * Handler for API error response
   */
     getErrors(obj) {
      let string = '';
      let errors = [];
      let profileErrors = [];
      errors = Object.keys(obj);
      errors = errors.filter(e => e !== 'profile');
      if (obj['profile']) {
        profileErrors = Object.keys(obj['profile']);
      }
      string = this.getErrorString(errors, obj);
      if (obj['profile']) {
        string = string + `${this.getErrorString(profileErrors, obj['profile'])}`
      }
      string=string.replace(':',' ');
      string=string.replace('_',' ');
      this.alertService.error(this.capitalizeFirstLetter(string.toLowerCase()));
    }

    capitalizeFirstLetter(string) {
      return (string[0].toUpperCase() + string.slice(1));
    }

    getErrorString(errors, obj) {
      let string = '';
      errors.forEach(field => {
        let errNames = Object.keys(obj[field]);
        errNames.forEach(err => {
          string = string + `${field}: ${(obj[field][err])}\n`
        });
      });
      return string;
    }

  close() {
    this.activeModal.close('yes');
  }
}