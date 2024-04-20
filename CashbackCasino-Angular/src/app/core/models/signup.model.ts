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
  export class SignupModel {
  
    user: UserData;
  
    constructor(obj) {
      let fullName = obj?.name?.split(" ");
      this.user = {
        email: obj.email,
        password: obj.password,
        country: obj.country?.code,
        profile_attributes: {
          mobile_phone: obj.contactNo?.e164Number?String(obj.contactNo.e164Number):'',
          currency: obj.currency || '',
          postal_code: obj.postalCode?String(obj.postalCode):'',
          first_name: obj?.firstName,
          last_name: obj?.lastName,
        },
        date_of_birth:(obj?.dob?.yy)?`${obj.dob?.yy}-${obj.dob?.mm}-${obj.dob?.dd}`:'',
        gender: obj.gender,
        city: obj.city,
        address: obj.address,
        terms_acceptance: obj.termsAcceptance || obj.terms_acceptance,
        age_acceptance: obj.ageTermsAcceptance,
        receive_sms_promos: obj.receive_promos ,
        receive_promos: obj.receive_promos
      }
  
    }
  }
  