import { Component, OnInit } from '@angular/core';
import { HttpService } from 'src/app/core/services/http.service';
import { APIS } from 'src/app/common/constants';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TwoFactorAuthModel } from 'src/app/core/models/two-factor-auth.model';

@Component({
  selector: 'app-two-factor-auth',
  templateUrl: './two-factor-auth.component.html',
  styleUrls: ['./two-factor-auth.component.scss']
})
export class TwoFactorAuthComponent implements OnInit {

  twoFactorVerification: FormGroup;
  submitted;
  public otp = false;
  constructor(
    private httpservice: HttpService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  /**
   * Form Initialization
   */
  initForm() {
    this.twoFactorVerification = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  /**
   * On Submitting form
   */
  submit() {
    this.submitted = true;
    if (this.twoFactorVerification.invalid) {
      return;
    }
    let data = new TwoFactorAuthModel(this.twoFactorVerification.value);
    this.httpservice.postData(APIS.SIGN_IN, data).subscribe((res: any) => {
      if (res.two_factor_enabled) {
        this.otp = true;
        this.changeFormControls(this.otp);
        this.submitted = false;
      } else {
        //Navigate to home page on succesfull login
      }
    });

  }

  /**
   * Dynamically adding and removing form controls
   * @param otp 
   */
  changeFormControls(otp) {
    if (otp) {
      this.twoFactorVerification.removeControl('email');
      this.twoFactorVerification.removeControl('password');
      this.twoFactorVerification.addControl('otp', this.fb.control('', Validators.required));
    }
  }

  /**
   * Get form controls
   */
  get controls() {
    return this.twoFactorVerification.controls;
  }
}
