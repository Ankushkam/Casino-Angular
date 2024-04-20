import { FormGroup, AbstractControl, FormControl } from '@angular/forms';

/**
 * Function to validate two form fields match values
 * @param controlName name of form control you want to match with
 * @param matchingControlName name of form control whoes value you want to match with controlName
 */
export function mustMatch(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
        const control = formGroup.controls[controlName];
        const matchingControl = formGroup.controls[matchingControlName];

        if (matchingControl.errors && !matchingControl.errors.mustMatch) {
            // return if another validator has already found an error on the matchingControl
            return;
        }

        // set error on matchingControl if validation fails
        if (control.value !== matchingControl.value) {
            matchingControl.setErrors({ mustMatch: true });
        } else {
            matchingControl.setErrors(null);
        }
    }
}

/**
 * Function to remove empty space from input field
 * @param control FormControl
 */
export function removeSpaces(control: AbstractControl) {
    if (control && control.value && !control.value.replace(/\s/g, '').length) {
        control.setValue('');
    }
    return null;
}


export function arrayFlat(arr: Array<any>, depth: number = 1) {
    return depth > 0 ? arr.reduce((acc, val) => acc.concat(Array.isArray(val) ? arrayFlat(val, depth - 1) : val), []) : arr.slice();
};

export function DOBValidate(dd, mm, yy) {
    return (formGroup: FormGroup) => {
        if (formGroup.controls[dd].value && formGroup.controls[mm].value && formGroup.controls[yy].value) {
            let currentDate = new Date();
            if (formGroup.controls[dd].value > currentDate.getDate() || formGroup.controls[mm].value > currentDate.getMonth() + 1 || formGroup.controls[yy].value > currentDate.getFullYear() / 100) {

            }
        }
    }
}

export function getScrollHeight(event) {

    if (document.body.scrollTop > 10) {
        document.getElementById('header')?.classList.add('header-sticky');
    } else {
        document.getElementById('header')?.classList.remove('header-sticky');
    }
}