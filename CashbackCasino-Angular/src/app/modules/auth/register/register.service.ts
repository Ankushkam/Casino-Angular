
import { Injectable } from '@angular/core';
import { POSTAL_CODES } from 'src/app/common/postal_codes';
import { COUNTRY_CODES } from 'src/app/common/country_codes';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {
  postalCodes= POSTAL_CODES;
  countryCodes=COUNTRY_CODES;
  constructor() { }

  /**Function to fetch postal code REGEX on basis of COUNTRY code */
  getRegexForPostalCode(countryObj: any) {
    let record=this.postalCodes.find((data)=>{
        return data.ISO==countryObj.code;
    });
    if(record) {
        return record.Regex;
    }
  }

  getCountryCode(countryObj:any) {
      return this.countryCodes[countryObj.code];
  }

}
