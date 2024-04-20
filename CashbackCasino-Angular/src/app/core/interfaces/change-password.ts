export interface ChangePassword {
    user:{
        currrent_password: string,
        password: string,
        password_confirmation: string
    }
}