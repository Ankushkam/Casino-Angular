interface UserData {
  email: string;
  password: string;
  profile_attributes: PROFILE
  country: string;
  city: string;
  address: string;
  gender: string,
  date_of_birth: string;
  terms_acceptance: boolean;
  age_acceptance: boolean;
  personal_id_number?: string;

  // full_name: string;
  receive_promos: boolean;
  receive_sms_promos: boolean;
}

interface PROFILE {
  currency: string;
  first_name: string;
  last_name: string;
  mobile_phone: string;
  postal_code: string;
}
export class RegisterModel {

  user: UserData;

  constructor(obj, address,moment) {
    let year;
    if (String(obj.dob?.yy).length == 2) {
      let string = `${obj.dob?.dd}/${obj.dob?.mm}/${obj.dob?.yy}`;
      let date = moment(string,"DD/MM/YY").format("YYYY/MM/DD h:mm:ss A")
      let today = new Date();
      let myDOB = new Date(date);
      if (today < myDOB) {
        myDOB.setFullYear(myDOB.getFullYear() - 100);
      }
       year = myDOB.getFullYear()
    } else {
      year = obj.dob?.yy;
    }
    let fullName = obj?.name?.split(" ");
    this.user = {
      email: obj.email,
      password: obj.password,
      country: obj.country?.code,
      profile_attributes: {
        mobile_phone: obj.phoneNumber?String(obj.phoneNumber):'',
        currency: obj.currency || '',
        postal_code: obj.postalCode?String(obj.postalCode):'',
        first_name: fullName?fullName[0]:'',
        last_name: fullName?fullName[fullName?.length - 1]:'',
      },
      // date_of_birth: new Date(`${obj.dob.yy}-${obj.dob.mm}-${obj.dob.dd}`),
      // date_of_birth: new Date(Date.UTC(obj.dob?.yy, obj.dob?.mm-1, obj.dob?.dd,0,0,0)),
      date_of_birth:(obj?.dob?.yy)?`${year || obj.dob?.yy}-${obj.dob?.mm}-${obj.dob?.dd}`:'',
      gender: obj.gender,
      city: obj.city,
      // address: `${obj.houseNumber} ${obj.street} ${obj.province}`,
      //  address: `${obj.houseNumber} ${obj.street}`,
      address: address?String(address):obj.street,
      terms_acceptance: obj.termsAcceptance || obj.terms_acceptance,
      age_acceptance: obj.ageTermsAcceptance,
      receive_sms_promos: obj.recieveSmsPromos ,
      receive_promos: obj.recieveSmsPromos
      // personal_id_number:obj.pid ||"123456"
    }

  }
}
