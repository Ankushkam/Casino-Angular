import { Component, OnInit } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { mustMatch } from 'src/app/common/utils';
import { DEFAULT_VALUES } from 'src/app/common/constants';
import { AuthService } from 'src/app/core/services';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertService } from 'src/app/core/services/alert.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'change-password',
    templateUrl: './change-password.component.html',
    styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {
    form: FormGroup;
    step: number = 1;
    constructor(
        private formBuilder: FormBuilder,
        private activeModal: NgbActiveModal,
        private authService: AuthService,
        private alertService: AlertService,
        private translate: TranslateService
    ) { }

    ngOnInit(): void {
        this.initForm();
    }

    /** -- function to initialize the form */
    initForm() {
        this.form = this.formBuilder.group({
            current_password: ['', [Validators.required, Validators.minLength(DEFAULT_VALUES.PASSWORD_MIN_LENGTH)]],
            password: ['', [Validators.required, Validators.minLength(DEFAULT_VALUES.PASSWORD_MIN_LENGTH)]],
            password_confirmation: ['', [Validators.required]],
        }, {
            validator: mustMatch('password', 'password_confirmation')
        });
    }
    get formControls() { return this.form.controls; }

    /** -- function to submit the form */
    onSubmit() {
        if (this.form.invalid) {
            return
        }
        this.authService.changePassword({ user: this.form.value }).subscribe(res => {
            this.step = 2;
        }, err => {
            if (err.current_password && err.current_password.invalid) {
                this.alertService.error("Your old password is not correct.")
            }
            if (err.password) {
                this.alertService.error(err.password.email_equivalent)
            }
        })
    }

    getTranslatedText(text) {
        return this.translate.instant(text);

    }

    close() {
        this.activeModal.close();
    }

    onPasswordStrengthChanged(event) {
        console.log("event: ", event)
    }
}   