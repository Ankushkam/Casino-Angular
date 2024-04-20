interface UserData {
    otp_attempt: string,
    email: string,
    password: string
}

export class TwoFactorAuthModel {
    user: UserData;
    constructor(data) {
        this.user = {
            email: (data || {}).email,
            password: (data || {}).password,
            otp_attempt: (data || {}).otp
        }
    }
}