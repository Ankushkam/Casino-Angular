export interface ResetPassword {
    user:{
        password: string,
        password_confirmation: string,
        reset_password_token: string,
    }
}