import { Component, OnInit, Input } from '@angular/core';
import { errorMsgs } from 'src/app/common/constants';
@Component({
  selector: 'display-field-error',
  templateUrl: './form-error.component.html',
  styleUrls: ['./form-error.component.scss']
})
export class FormErrorComponent implements OnInit {
  @Input() fieldName: string;
  @Input() formControls:any;
  @Input() options?: any;
  field: any;
  constructor() {}

  ngOnInit(): void {
    if(this.formControls && this.formControls[this.fieldName]){
      this.field = this.formControls[this.fieldName];
    }
  }
  getFieldError(key){
    let errorKey = Object.keys(this.formControls[key].errors)[0];
    if(errorMsgs[key]) {
      return errorMsgs[key][errorKey];
    }
    return `Invalid ${key}` 
  }
}