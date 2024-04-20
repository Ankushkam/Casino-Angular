export interface Email {
    user: {
        email: string,
        captcha? : string // optional
    }
}