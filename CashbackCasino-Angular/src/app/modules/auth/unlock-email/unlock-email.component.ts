import { SupportService } from './../../../core/services/support.service';
import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService, HttpService, ModalService } from 'src/app/core/services';
import { APIS } from 'src/app/common/constants';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { ReCaptchaV3Service } from 'ngx-captcha';
import { LoginComponent } from '../login/login.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'unlock-email',
  templateUrl: './unlock-email.component.html',
  styleUrls: ['./unlock-email.component.scss']
})
export class UnlockEmailComponent implements OnInit {
  @Input() emailId: string = "";
  form: FormGroup;
  isSubmit: Boolean;
  showCaptcha: Boolean = false;
  captchaVersion: Number;
  siteKey: string;
  @Input() step: number = 1;
  closeModal: Boolean = false;
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private httpService: HttpService,
    private activeModal: NgbActiveModal,
    private modalService:ModalService,
    private router: Router,
    private reCaptchaV3Service: ReCaptchaV3Service,
    private supportService: SupportService,
    private translate:TranslateService
  ) { }

  ngOnInit(): void {
    if (this.step > 3) {
      this.router.navigate(['/']);
    }
    this.playerSetting();
    this.initForm();
  }

  /** -- function to initialize the form */
  initForm() {
    this.form = this.formBuilder.group({
      email: [this.emailId, [Validators.required, Validators.email]],
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
    this.authService.sendUnlockEmail(submitData).subscribe(res => {
      this.step = 3;
    }, err => {
      if (err.email && err.email.not_locked) {
        this.step = 6;
      }
    });
  }
  stepMove(step) {
    this.step = step;
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
    }
  }

  getTranslatedText(text) {
    return this.translate.instant(text);

  }
  openChatWindow() {
    this.supportService.show();
  }

}