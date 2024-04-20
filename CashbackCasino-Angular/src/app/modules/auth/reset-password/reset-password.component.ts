import { AlertService } from './../../../core/services/alert.service';
import { HttpService } from './../../../core/services/http.service';
import { ActivatedRoute, Router } from '@angular/router';
import { mustMatch } from 'src/app/common/utils';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';

import * as _ from 'lodash';

import { REGEX, FORM_VALIDATION, APIS, MESSAGES } from './../../../common/constants';
import { TranslateService } from '@ngx-translate/core';

interface IResetPassword {
  invalid?: string
}

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  form: FormGroup;
  reset_password_token: string;
  ERRORS = _.cloneDeep(FORM_VALIDATION);
  MESSAGES = _.cloneDeep(MESSAGES);
  constructor(
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private httpService: HttpService,
    private alertService: AlertService,
    private router: Router,
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
        this.alertService.success(this.getMessages(MESSAGES.SUCCESS.RESET_PASSWORD));
        this.router.navigateByUrl('/')
      }, err => {
      })
  }

  getMessages(message) {
    return this.translate.instant(message);
  }

  get controls() {
    return this.form.controls;
  }

  onPasswordStrengthChanged(score) {
    // console.log('new score', score);
  }


}
