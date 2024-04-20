import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ReCaptchaV3Service } from 'ngx-captcha';
import { APIS, DEFAULT_VALUES, REGEX } from 'src/app/common/constants';
import { AlertService, AuthService, HttpService, ModalService, SharedService } from 'src/app/core/services';
import { ConfirmationEmailComponent } from '../confirmation-email/confirmation-email.component';
import { ForgotPasswordComponent } from '../forgot-password/forgot-password.component';
import { RegisterComponent } from '../register/register.component';
import { UnlockEmailComponent } from '../unlock-email/unlock-email.component';
import { UpdatetermsComponent } from '../../users/updateterms/updateterms.component';
import { SignupComponent } from '../signup/signup.component';

@Component({
  selector: 'app-login-mobile',
  templateUrl: './login-mobile.component.html',
  styleUrls: ['./login-mobile.component.scss']
})
export class LoginMobileComponent implements OnInit {
  form: FormGroup;
  depositComponent;
  isSubmit: Boolean;
  empty = 0.00;
  title;
  show: Boolean = false;
  showCaptcha: Boolean = false;
  captchaVersion: Number;
  siteKey: string;
  step: number = 1;
  formHeaderText: string = "login_to_praise_casino";
  closeModal: Boolean = false;
  currency = 'EUR';
  playerData;
  successMessage;
  allCurrencies = [];
  STEPS = {
    LOGIN_FORM: 1,
    STATUS: 2
  }
  isLoggedIn: boolean = false;
  mobileView: string = "left";
  mobile: boolean = false;
  currentCountry:string
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.mobile = (window.innerWidth <= DEFAULT_VALUES.MOBILE_SIZE) ? true : false;
  }
  route;
  redirectionRoute;
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private httpService: HttpService,
    private activeModal: NgbActiveModal,
    private router: Router,
    private translate: TranslateService,
    private reCaptchaV3Service: ReCaptchaV3Service,
    private alertService: AlertService,
    private modalService: ModalService,
    private sharedService:SharedService
  ) {
    this.errorHandler = this.errorHandler.bind(this);
  }

  ngOnInit(): void {
    this.currentCountry = this.sharedService.currentIP.value.country_code;
    if (window.innerWidth <= DEFAULT_VALUES.MOBILE_SIZE) { // 768px portrait
      this.mobile = true;
    }
    // First we get the viewport height and we multiple it by 1% to get a value for a vh unit
    let vh = window.innerHeight * 0.01;
    // Then we set the value in the --vh custom property to the root of the document
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    this.authService.authentication.subscribe((res) => {
      this.isLoggedIn = !!res;
    })
    this.playerSetting();
    this.initForm();
  }

  /** -- function to initialize the form */
  initForm() {
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.pattern(REGEX.EMAIL), Validators.maxLength(64)]],
      password: ['', [Validators.required]],
      captcha: ['', []],
    });
  }

  /** - get player settings */
  playerSetting() {
    this.httpService.getData(APIS.PLAYER.SETTINGS).subscribe(resp => {
      // TODO: Handle Response
      let config = resp.body;
      this.showCaptcha = !!config.recaptcha;
      this.siteKey = config.recaptcha;
      this.captchaVersion = config.recaptcha_version || 2;
      if (this.showCaptcha && this.captchaVersion == 3) {
        this.reCaptchaV3Service.execute(this.siteKey, '', (token) => {
          this.controls.captcha.patchValue(token);
        });
      }
    });
  }

  /** -- function to submit the form */
  onSubmit() {

    this.isSubmit = true;
    if (this.form.invalid) {
      this.validateAllFormFields(this.form);
    }
    else {
      let submitData = { user: this.form.value };
      if (this.showCaptcha && submitData.user.captcha === "") {
        submitData.user.captcha = "blank";
      }
      if (submitData.user.captcha === "") {
        delete submitData.user.captcha;
      }
      this.authService.login(submitData).subscribe((res: any) => {
        // TODO: Handle Response)
        this.authService.saveUserData(res);
        this.formHeaderText = "now_logged_in";
        this.close();
        this.httpService.getData(APIS.PLAYER.DATA).subscribe((res) => {
          this.playerData = (res || {}).body;
          var termsUpdateFlag = 0;
          if (this.playerData?.auth_fields_missed?.length > 0) {
            this.modalService.openModal(UpdatetermsComponent,{playerData:this.playerData});
          }
        })
      }, (err) => {
        if (err.email) {
          if (err.email.unconfirmed) {
            this.activeModal.close();
            this.modalService.openModal(ConfirmationEmailComponent, { emailId: this.form.value.email });
          }
          else if (err.email.not_found_in_database) {
            this.alertService.error(err.email['not_found_in_database'])
          }

        }
        else if (err.password) {
          if (err.password['wrong_password']) {
            this.alertService.error(err.password['wrong_password']);
          } else if (err.password['locked']) {
            this.activeModal.close();
            this.modalService.openModal(UnlockEmailComponent, { emailId: this.form.value.email });
          } else if (err.password['limit_restrict_access']) {
            // this.alertService.error(err.password['limit_restrict_access']);
            this.activeModal.close();
            this.modalService.openModal(UnlockEmailComponent, { step: 7 });
          }
        }
      });
    }
  }


  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  get formControls() { return this.form.controls; }

  stepSkip(step?) {
    if (step) this.step = step; else this.step++;
    if (this.mobile) this.mobileView = "left";

  }

  close(value?) {
      if(this.redirectionRoute && this.isLoggedIn){
        if(this.redirectionRoute.includes('play-games'))
        {
          this.router.navigate(['/play-games',this.route])

        } else{
        this.router.navigate([this.redirectionRoute]);
        }
      }
      this.activeModal.close();
  }
  openSignUpModal() {
    this.activeModal.close();
    this.modalService.openModal(SignupComponent);
  }

  openForgotPasswordModal() {
    this.activeModal.close();
    this.modalService.openModal(ForgotPasswordComponent);
  }



  get controls() {
    return this.form.controls;
  }

  goTo(path) {
    this.router.navigate([path]);
    this.activeModal.close();
  }


  getTranslatedText(text) {
    return this.translate.instant(text);

  }

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
