import { Component, OnInit, HostListener } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService, HttpService, AlertService, ModalService } from 'src/app/core/services';
import { APIS, DEFAULT_VALUES, REGEX } from 'src/app/common/constants';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ReCaptchaV3Service } from 'ngx-captcha';
import { RegisterComponent } from '../register/register.component';
import { LoginComponent } from '../login/login.component';
import { TranslateService } from '@ngx-translate/core';
import { SignupComponent } from '../signup/signup.component';

@Component({
  selector: 'forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent implements OnInit {
  form: FormGroup;
  otherForm: FormGroup;
  isSubmit: Boolean;
  showCaptcha: Boolean = false;
  captchaVersion: Number;
  siteKey: string;
  step: number = 1;
  closeModal: Boolean = false; mobileView: string = "left";
  mobile: boolean = false;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.mobile = (window.innerWidth <= DEFAULT_VALUES.MOBILE_SIZE) ? true : false;
  }
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private httpService: HttpService,
    private alertService: AlertService,
    private activeModal: NgbActiveModal,
    private reCaptchaV3Service: ReCaptchaV3Service,
    private modalService:ModalService,
    private translate:TranslateService
  ) { }

  ngOnInit(): void {
    if (window.innerWidth <= DEFAULT_VALUES.MOBILE_SIZE) this.mobile = true;
    // First we get the viewport height and we multiple it by 1% to get a value for a vh unit
    let vh = window.innerHeight * 0.01;
    // Then we set the value in the --vh custom property to the root of the document
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    this.playerSetting();
    this.initForm();
  }

  /** -- function to initialize the form */
  initForm() {
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.pattern(REGEX.EMAIL)]],
      captcha: ['', []],
    });
  }

  /** - get player settings */
  playerSetting() {
    this.httpService.getData(APIS.PLAYER.SETTINGS).subscribe(resp => {
      let config = resp.body;
      this.showCaptcha = !!config.recaptcha;
      this.siteKey = config.recaptcha;
      this.captchaVersion = config.recaptcha_version || 2;
      if (this.showCaptcha && this.captchaVersion == 3) {
        this.reCaptchaV3Service.execute(this.siteKey, '', (token) => {
          this.formControls.captcha.patchValue(token);
        });
      }
    })
  }

  get formControls() { return this.form.controls; }

  /** -- function to submit the form */
  onSubmit() {
    this.isSubmit = true;
    if (this.form.invalid) {
      return
    }
    let submitData = { user: this.form.value };
    if (this.showCaptcha && submitData.user.captcha === "") {
      submitData.user.captcha = "blank";
    }
    if (submitData.user.captcha === "") {
      delete submitData.user.captcha;
    }
    this.authService.forgotPassword(submitData).subscribe(res => {
      this.step = 2;
      if (this.mobile) this.mobileView = 'left';
    }, err => {
      if (err.email) {
        this.alertService.error(`Email is ${err.email['not_found']}`)
      }
    })
  }

  stepClass(step) {
    return this.step > step ? 'completed' : (this.step == step) ? 'next disabled' : 'disabled'
  }
  close(value?) {
    if (value == 'yes') {
      this.activeModal.close();
    }
    else {
      this.closeModal = !this.closeModal
    }
  }
  openModal(modal) {
    this.activeModal.close();
    switch (modal) {
      case 'login': this.modalService.openModal(LoginComponent); break;
      case 'register': this.modalService.openModal(SignupComponent); break;
      default: break;
    }
  }

  stepMove(step) {
    if (this.mobile) {
      this.mobileView = "right";
      this.step = step;
    }
  }

  getTranslatedText(text) {
    return this.translate.instant(text);

  }

  checkShowCase(side) {
    return (this.mobile && this.mobileView !== side) ? false : true;
  }

}