import { AlertService } from './../../../core/services/alert.service';
import { HttpService } from './../../../core/services/http.service';
import { ActivatedRoute, Router } from '@angular/router';
import { mustMatch } from 'src/app/common/utils';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit, ViewChild } from '@angular/core';

import * as _ from 'lodash';

import { REGEX, FORM_VALIDATION, APIS, MESSAGES } from './../../../common/constants';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { LoginComponent } from '../../auth/login/login.component';
import { ModalService } from 'src/app/core/services';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'ngbd-modal-content',
  template: `
   <div class="modal-body">
        <div class="singPupForm d-flex p-4 align-items-center">
        <div class="cancel-confirm">
					<div class="cancel-form w-100 text-center">
						<i class="d-block mb-3"><img src="assets/img/icons/check_icon.svg" width="70" alt="" /></i>
						<h4 class="mb-3">Password Changed!</h4>
						<p> {{successMessage}} </p>
						
						<div class="button-wrapper mt-4" style="transition:none;">
							<button (click)="activeModal.close(true)" class="btn btn-lg btn-primary text-uppercase mr-0">Log in
							<i  class="ml-2"><img src="assets/img/icons/arrow-right_icon.svg" width="20" alt=""></i>
							</button>
						</div>						
          </div>
          </div>
				</div>
			</div>
  `
})
export class NgbdModalContent {
  MESSAGES = _.cloneDeep(MESSAGES);
  successMessage;

  constructor(public activeModal: NgbActiveModal,private translate:TranslateService) { 
    this.successMessage=this.translate.instant(MESSAGES.SUCCESS.RESET_PASSWORD)
  }
}

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  @ViewChild('closePage') closePage;
  form: FormGroup;
  reset_password_token: string;
  ERRORS = _.cloneDeep(FORM_VALIDATION);
  MESSAGES = _.cloneDeep(MESSAGES);
  constructor(
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private httpService: HttpService,
    private alertService: AlertService,
    private modal: NgbModal,
    private modalService: ModalService,
    private activeModal: NgbActiveModal,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(res => {
      this.reset_password_token = res.reset_password_token;
    })

    this.form = this.fb.group({
      password: ['', [Validators.required, Validators.pattern(REGEX.PASSWORD)]],
      password_confirmation: ['', Validators.required]
    }, {
      validators: mustMatch('password', 'password_confirmation')
    })
  }

  onSubmit() {
    if (this.form.invalid) {
      return;
    }
    let data = {
      ...this.form.value,
      reset_password_token: this.reset_password_token
    }

    this.httpService.putData(APIS.PASSWORD, { user: data })
      .subscribe(res => {
        this.modal.open(NgbdModalContent, {
          centered: true,
          backdrop: 'static'
        }).result.then(res => {
          if (res) {
            this.modalService.openModal(LoginComponent);
          }
        })
      }, err => {
        if (err.reset_password_token['invalid']) {
          this.alertService.error('Link is Invalid or expired. Use try Forget Password on Login page again.')
        }
      })
  }

  login() {
    this.activeModal.close(true);
    // this.authService.userLogin();

  }

  getMessages(error) {
    return this.translate.instant(error);
  }

  get controls() {
    return this.form.controls;
  }

  onPasswordStrengthChanged(score) {
    // console.log('new score', score);
  }

}
