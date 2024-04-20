import { REGEX, DEFAULT_VALUES } from './constants';


export const STEPS = {
    EMAIL: 0,
    PASSWORD: 1,
    CURRENCY: 2,
    PHONE_NUMBER: 3,
    NAME: 4,
    COUNTRY_AND_POSTAL: 5,
    CITY: 6,
    STREET_NAME: 7,
    // HOUSE_NUMBER: 8,
    GENDER: 9,
    // PROVINCE: 9,
    DOB: 10,
    RECIEVE_SMS: 11,
    AGREE_POLICIES: 12,
    GET_PHONE_VERIFICATION_CODE: 13,
    // GENERATING_CODE: 14,
    // VALIDATE_CODE: 15,
    SUCCESS: 14,
    PROVINCE: 19,
    GENERATING_CODE: 20,
    VALIDATE_CODE: 21,
}

export const SIGNUP_STEPS = {
    LOGIN_DETAILS:1,
    ACCOUNT_INFO:2,
    CONFIRM_YOUR_ACCOUNT:3,
    CONFIRM_YOUR_ACCOUNT2:4,
    CONFIRM_YOUR_ACCOUNT3:5,
    GET_BONUS:6
}
   


export const REGISTER_STEPS = [
    {
        step: 0,
        data: [
            {
                name: 'email',
                type: 'text',
                validations: {
                    required: true,
                    pattern: REGEX.EMAIL
                    // email: true
                }
            }
        ]
    },
    {
        step: 1,
        data: [
            {
                name: 'password',
                type: 'password',
                validations: {
                    required: true,
                    pattern: REGEX.PASSWORD,
                    minLength: DEFAULT_VALUES.PASSWORD_MIN_LENGTH
                }
            }
        ]
    },
    {
        step: 2,
        data: [
            {
                name: 'currency',
                type: 'text',
                validations: {
                    required: true,
                }
            }
        ]
    },
    {
        step: 3,
        data: [
            {
                name: 'phoneNumber',
                type: 'text',
                validations: {
                    required: true,
                    pattern: REGEX.CONTACT_NUMBER,
                    maxLength: 16,
                    minLength: 5
                }
            }
        ]
    },
    {
        step: 4,
        data: [
            {
                name: 'name',
                type: 'text',
                validations: {
                    required: true,
                    minLength: 1,
                    pattern: REGEX.ATLEAST_TWO_WORDS
                }
            }
        ]
    },
    {
        step: 5,
        data: [
            {
                name: 'country',
                type: 'text',
                validations: {
                    required: true,
                }
            },
            {
                name: 'postalCode',
                type: 'text',
                validations: {
                    required: true,
                    pattern: REGEX.ATLEAST_TWO_WORDS
                }
            }
        ]
    },
    {
        step: 6,
        data: [
            {
                name: 'city',
                type: 'text',
                validations: {
                    required: true,
                }
            }
        ]
    },
    {
        step: 7,
        data: [
            {
                name: 'street',
                type: 'text',
                validations: {
                    required: true,
                }
            }
        ]
    },
    // {
    //     step: 8,
    //     data: [
    //         {
    //             name: 'houseNumber',
    //             type: 'text',
    //             validations: {
    //                 required: true,
    //             }
    //         }
    //     ]
    // },
    {
        step: 9,
        data: [
            {
                name: 'gender',
                type: 'text',
                validations: {
                    required: true,
                }
            }
        ]
    },
    // {
    //     step: 9,
    //     data: [
    //         {
    //             name: 'province',
    //             type: 'text',
    //             validations: {
    //                 required: true,
    //             }
    //         }
    //     ]
    // },
    {
        step: 11,
        data: [
            {
                name: 'recieveSmsPromos',
                type: 'text',
                validations: {
                    required: true,
                }
            }
        ]
    },
    {
        step: 12,
        data: [
            {
                name: 'termsAcceptance',
                type: 'text',
                validations: {
                }
            },
            {
                name: 'ageTermsAcceptance',
                type: 'text',
                validations: {
                }
            }
        ]
    }
]
