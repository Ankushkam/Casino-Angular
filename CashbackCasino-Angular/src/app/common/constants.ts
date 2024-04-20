
export const USER_DETAILS = {
    Token: 'token',
    FirstName: 'first_name',
    LastName: 'last_name',
    CasinoSession: '_casino_session',
    Currency: 'currency',
    Country: 'country',
    Locale: 'locale',
    OriginalUserId: "original_user_id",
    Email: 'email',
    IsLoggedIn: 'isLoggedIn'
}

export const APIS = {
    REGISTRATION: '/api/users',
    CURRENT_IP: '/api/current_ip',
    SIGN_OUT: '/api/users/sign_out',
    SIGN_IN: '/api/users/sign_in',
    AUTO_LOGIN: '/api/users/autologin',
    SESSION_LIST: '/api/player/sessions',
    COUNTRY_LIST: '/api/info/countries',
    UPDATE_LOCALE: '/api/player/update_locale',
    UPDATE_CURRENCY: '/api/player/accounts',
    CURRENCIES: '/api/info/currencies',
    RESEND_VERIFICATION_CODE: '/api/player/phone/resend_verification_code',
    TWO_FACTOR_ENABLING: '/api/player/two_factor',
    EMAIL_CONFORMATION: '/api/users/confirmation',
    UNLOCK_EMAIL: '/api/users/unlock',
    ALL_AUTH_PROVIDERS_LIST: '/api/info/auth_providers',
    STATUSES: '/api/info/statuses',
    CONNECTED_SOCIAL_PROVIDERS: '/api/auth_providers',
    PAY_N_PLAY: {
        URLS: "/api/payments/pay_n_play/urls",
        SETTINGS: "/api/payments/pay_n_play/settings",
        SIGN_IN_FORM: '/users/auth/pay_n_play',
        SIGN_UP: '/users/auth/pay_n_play/pnp_sign_up',
        SIGN_IN: '/users/auth/pay_n_play/pnp_sign_in'
    },
    PAYMENTS: {
        PAYMENT_PROCESSING: '/api/payment_processing',
        PAYMENT_METHODS: '/api/payments/payment_methods',
        PAYMENT_ACCOUNTS: '/api/player/payment_accounts',
        HISTORY: '/api/player/payments',
        PAYMENT_CANCEL:'/api/payments/cancel'
    },
    BONUS_PREVIEW: {
        REGISTRATION_BONUSES: '/api/bonuses/registration',
        DEPOSIT_BONUSES: '/api/bonuses/deposit',
        COLLECT: '/api/bonuses/collect',
        ACTIVATE_COUPON: '/api/bonuses/coupon',

    },
    USER: '/api/users',
    PASSWORD: '/api/users/password',
    USER_LIMITS: '/api/user_limits',
    USER_LIMIT_CONFIRM: '/api/user_limits/confirm',
    PLAYER: {
        SETTINGS: '/api/player/settings',
        STATS: '/api/player/stats',
        DATA: '/api/player',
        GROUPS: '/api/player/groups',
        GAMES: '/api/player/games',
        FREESPINS: '/api/player/freespins',
        BONUSES: '/api/player/bonuses',
        FIELDS: '/api/info/player_fields',
        ACCOUNTS: '/api/player/accounts',
        ACTIVATE_BONUS: '/api/player/bonuses/:id/activation',
        DELETE_BONUS: '/api/player/bonuses/:id',
        DEPOSIT_BONUSES: '/api/bonuses/deposit',
        ACTIVATE_FREESPIN: '/api/player/freespins/:id/activation',
        DELETE_FREESPIN: '/api/player/freespins/:id',
        DOCUMENTS: '/api/player/documents',
        COMP_POINTS: '/api/player/comp_points',
        UPDATE_BONUS_SETTINGS: '/api/player/update_bonus_settings',
        REALITY_CHECK: '/api/player/reality_check',
        UPDATE_PLAYER: '/api/auth_providers/update_details',
        SET_DEPOSIT_BONUS_CODE:'/api/player/set_bonus_code',
        REMOVE_DEPOSIT_BONUS_CODE:'/api/player/clear_bonus_code',
        RESTRICTIONS:'/api/restrictions',
        RESTRICTION_MARKS:'/api/restrictions/marks'
    },
    GAMES: {
        PROVIDERS: '/api/games/providers',
        ORDER: '/api/games/order',
        JACKPOTS: '/api/games/jackpots',
        COLLECTIONS: '/api/games/collections',
        GAMES: '/api/games',
        DESKTOP_ALLOWED: '/api/games/allowed_desktop',
        ALLOWED_GAMES:'/api/games_info/allowed',
        MOBILE_ALLOWED: '/api/games/allowed_mobile',
        FAVORITE: '/api/player/favorite_games',
        RECENT_GAMES: '/api/player/played_games',
    },
    TOURNAMENTS: {
        TOURNAMENTS: '/api/tournaments',
        RECENT_TOURNAMENTS: '/api/tournaments/recent',
        USER_TOURNAMENT_STATUSES: '/api/tournaments/statuses',
        PLAYER_TOURNAMENTS: '/api/tournaments/player',
        CONFIRM_PARTICIPATION: '/api/tournaments/:id/confirm',
        TOURNAMENT_INFO: '/api/tournaments/:id'
    },
    SUPPORT: '/api/send_contact_message',
    WINNERS: '/api/stats/winners/latest',
    GROUPS: '/api/info/statuses',
    CMS: {
        SNIPPETS: "/api/cms/snippets",
        PAGES: "/api/cms/pages"
    },
    INFO: {
        LOCALE: '/api/info/locale',
        LOCALES: '/api/info/locales',
        AFFILIATES:'/api/info/affiliate'
    }
}

export const WINNER_TYPE = {
    LATEST: 'latest',
    TOP: 'top'
}

export const OFFER_TYPES = {
    BONUS: 'bonus',
    FREESPIN: 'freespin'
}

export const PROMOTION_BONUSES_TYPE = {
    CASHBACK: 'Cashback',
    NUMBER: 'number',
    HIGHROLLER: 'highroller',
    STANDARD: 'standard',
    SPRING:'spring'
}

export const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export const ACTIVE_BONUS_STAGES = {
    HANDLE_BETS: 'handle_bets',
    ISSUED: 'issued',
    WAIT: 'wait'
}

export const ACTIVE_FREESPIN_STAGES = {
    ISSUED: 'issued',
    ACTIVE: 'activated'
}

export const GAMES_LIST = {
    HOME_TITLE: 'OUR GAMES',
    GAME_LIST_TITLE: 'CASINO',
    CASINO: 'CASINO',
    NEW_GAMES_RIBBON_SHOW_LIMIT: 8,
    CATEGORY_GAMES: 'CATEGORY_GAMES'
}

export const DEFAULT_VALUES = {
    PASSWORD_MIN_LENGTH: 8,
    GAME_LIMIT: 8,
    SHOW_MORE_GAMES_LIMIT: 32,
    SHOW_MORE_ROWS: 8,
    INITIAL_INDEX: 0,
    MAX_GAMES_IN_ROW_DESKTOP: 4,
    MAX_GAMES_IN_ROW_MOBILE: 2,
    DISPLAY_DEFAULT_ROWS_DESKTOP: 2,
    DISPLAY_DEFAULT_ROWS_MOBILE: 4,
    GAME_TAB: 'All Games',
    MOBILE_SIZE_SMALL: 767,
    MOBILE_SIZE: 820,
    IPAD_SIZE: 1024,
    LOCALE: 'en'
}

export const COUNTRIES_LOCALES={
 DE:'de',
 IN:'en',
 FI:'fi',
 HU:'hu',
 JP:'ja',
 NO:'no',
 PL:'pl',
 FR:'fr',
 CA:'en-CA',
 NZ:'en-NZ',
 CH:'de',
 AT:'de',
 IE:'en',
 NL:'en',
 SE:'en',
 AU:'en-AU'
}

export const GAMES_FILTER_KEYS = {
    NEW: 'new',
    POPULARITY: 'popular',
    // POPULAR_JAPAN: "popular:ja",
    LIVE_CASINO: 'live',
    JACKPOT: 'jackpot',
    ROULLETE: 'roulette',
    BACCARAT: 'baccarat',
    BLACKJACK: 'blackjack',
    POKER: 'poker',
    CARD: 'card',
    LIVE_CARDS_AND_POKER: 'live_cards_poker',
    MEGAWAYS: 'megaways',
    EPIC_WINS: 'epic_wins',
    CLASSIC_FRUIT_MACHINES: 'fruit_machines',
    WIN_BOTH_WAYS: 'Win_both_ways',
    CLUSTER_PLAYS: 'cluster',
    BONUS_BUYS:'bonus_buys',
    OTHERS: 'others',
    LIVE_POPULAR:'live_popular',
    LIVE_ALL:'live'
}

export const FLAGS = [
    // { link: 'en-CA', value: 'ENGLISH - CANADA', iconClass: "mr-1", src: 'assets/img/ca-flag.png' },
    { link: 'de', value: 'DEUTSCH', iconClass: "mr-1", src: 'assets/img/de-flag.png' },
    { link: 'en', value: 'ENGLISH', iconClass: "mr-1", src: 'assets/img/eng-flag.png' },
    // { link: 'en-IN', value: 'ENGLISH - INDIA', iconClass: "mr-1", src: 'assets/img/in-flag.png' },
    // { link: 'fi', value: 'SUOMI', iconClass: "mr-1", src: 'assets/img/fi-flag.png' },
    // { link: 'fr', value: 'FRANCAIS - CANADA', iconClass: "mr-1", src: 'assets/img/fr-flag.png' },
    // { link: 'hi', value: 'HINDI', iconClass: "mr-1", src: 'assets/img/in-flag.png' },
    // { link: 'hu', value: 'HUNGARIAN', iconClass: "mr-1", src: 'assets/img/hu-flag.png' },
    // { link: 'ja', value: '日本語', iconClass: "mr-1", src: 'assets/img/jp-flag.png' },
    // { link: 'no', value: 'NORWEGIAN', iconClass: "mr-1", src: 'assets/img/no-flag.png' },
    // { link: 'en-NZ', value: 'ENGLISH - NEW ZEALAND', iconClass: "mr-1", src: 'assets/img/nz-flag.png' },
    // { link: 'en-AU', value: 'ENGLISH - AUSTRALIA', iconClass: "mr-1", src: 'assets/img/au-flag.png' },
    // { link: 'ar', value: 'ARABIC', iconClass: "mr-1", src: 'assets/img/united-arab-emirates.png' },
    // { link: 'es', value: 'SPANISH', iconClass: "mr-1", src: 'assets/img/spain.png' },
    // { link: 'zh-CN', value: 'CHINESE', iconClass: "mr-1", src: 'assets/img/china.png' },
    // { link: 'it', value: 'ITALIAN', iconClass: "mr-1", src: 'assets/img/italy.png' },
]

export const GAME_PLAY = {
    GAMES_LIMIT: 15
}

export const REGEX = {
    PASSWORD: /^(?=.*[A-Za-z])(?=(.*[\d]){1,})(?=.*?[^\w\s]).{8,}$/, //Contains 8 characters atleast 1 number, 1 alphabet, 1 special char
    CONTAIN_ONE_DIGIT: /(?=.*\d)/,
    CONTAIN_ONE_ALPHABET: /(?=.*[A-Za-z])/,
    CONTAIN_ONE_SPECIAL_CHAR: /(?=.*\W)/,
    PHONE_NUMBER: /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/,
    FULL_NAME: /^[a-zA-Z\s]+$/i,
    // ATLEAST_TWO_WORDS: /^[a-zA-Z]{1,}(?: [a-zA-Z]+){1,2}$/,
    ATLEAST_TWO_WORDS: /^[^0-9]{1,}(?: [^0-9]+){1,2}$/,
    ONLY_DIGITS: /^[0-9]*$/,
    CONTACT_NUMBER:/^[\d +]*$/,
    EMAIL: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/
}

export const FORM_VALIDATION = {
    REQUIRED: {
        PASSWORD: 'forms.messages.password_required'
    },
    PASS_REGEX: 'forms.messages.pass_regex',
    MISMATCH_CONFIRM_PASSWORD: 'forms.messages.mismatch_confirm_password',
    AMOUNT_LESS_THAN_REQUIRED: 'forms.messages.amount_less_than_required',
    AMOUNT_EXCEEDING_LIMIT: 'forms.messages.amount_exeeding_limit'
}

export const MESSAGES = {
    SUCCESS: {
        RESET_PASSWORD: 'forms.messages.reset_password',
        REQUEST_ACCEPTED: 'forms.messages.request_accepted'
    }
}

export const BONUS_PROMOS={
    NORMAL:'normal',
    PROMO:"promo",
    PROMO_150:"promo150"
}

export const URLS = {
    PAYMENT_LOGO: '//logos/payments/color',
    PAYMENT_LOGO_WHITE: '//logos/payments/white'
}


export const errorMsgs = {
    email: {
        required: "Email is required",
        pattern: "Please enter a valid email address.",
        maxlength: "Email length should be of maximum 64 characters"
    },
    current_password: {
        required: "Password is required",
        minlength: `Password must be atleast ${DEFAULT_VALUES.PASSWORD_MIN_LENGTH} characters long.`
    },
    password: {
        required: "Password is required",
        minlength: `Password must be atleast ${DEFAULT_VALUES.PASSWORD_MIN_LENGTH} characters long.`
    },
    password_confirmation: {
        required: "password confirmation is required",
        mustMatch: `Confirm password not matched your above password.`
    },
    mobile_phone: {
        required: "Phone number is required",
    },
    address: {
        required: "Street address is required",
    },
    postal_code: {
        required: "Postal code is required",
    },
    city: {
        required: "City is required",
    },
    amount: {
        required: "Amount is required",
    },
    currency: {
        required: "Currency is required",
    }
};


export const ROUTING = {
    USER: {
        LOGIN: '/users/sign_in',
        SIGNUP: '/users/sign_up',
        FORGOT_PASSWORD: '/users/password/new',
        PROFILE: '/profile/info',
        PROFILE_EDIT: '/profile/edit',
        DEPOSITS: '/profile/limits',
        DOCUMENTS:'/documents',
        HISTORY:'/accounts/history',
        DE_PROMO:'/de-promo',
        FR_PROMO:'/fr-promo',
        FI_PROMO:'/fi-promo',
        NZ_PROMO:'/nz-promo',
        EN_PROMO:'/en-promo',
        CA_PROMO:'/ca-promo',
        NO_PROMO:'/no-promo',
        DE_PROMO_150:'/de-promo150',
        FR_PROMO_150:'/fr-promo150',
        FI_PROMO_150:'/fi-promo150',
        NZ_PROMO_150:'/nz-promo150',
        EN_PROMO_150:'/en-promo150',
        CA_PROMO_150:'/ca-promo150',
        NO_PROMO_150:'/no-promo150',
        EN_EN:"/en-en"

    }
}

export const TOURNAMENTS = {
    TEMPLATE_TYPE: {
        CARD: 'tournament-card',
        BANNER: 'tournament-banner',
        INNER_HEADER: 'tournament-inner-head',
        INNER_BOTTOM: 'tournament-inner-bottom',
        CURRENT: 'current-tournament'
    }
}

export const PROMOTIONS = {
    TEMPLATE_TYPE: {
        CARD: 'promotions-card',
        HEAD: 'promotions-head',
        BOTTOM: 'promotions-bottom'
    }
}

export const ONE_SIGNAL = {
    CONFIG: {
        APP_ID: 'ff12606a-49f3-4457-8c97-89e6a2f171ef',
        ALLOW_LOCALHOST_SECURE_LOGIN: true,
        AUTO_RESUBSCRIBE: true
    }
}

export const NOTIFICATION_TYPES = {
    FREESPINS: 'freespins',
    BONUS: 'bonus',
    PAYMENT: 'payment',
    WAGER_DONE: 'wager_done',
    STATUS: 'status',
    TOURNAMENT: 'tournament',
    GAME_LIMITS: 'game_limits',
    WINNERS: 'winners',
    GROUPS: 'groups'
};

export const MODALS = {
    DEPOSIT: 'deposit',
    WITHDRAWAL: 'withdrawal',
    LOGIN: 'login',
    SIGNUP: 'signup',
    PROFILE: 'profile',
    BONUSES: 'bonuses'

}

export const PAY_N_PLAY_COUNTRIES = []

export const PAY_N_PLAY_AMOUNT_OPTIONS = [20, 50, 100];

export const DISCARDED_PAYMENT_METHODS = [
    // { brand: 'ideal', provider: 'devcode' }
    { brand: 'siru', provider: 'devcode' },
    // { brand: 'eco_payz', provider: 'accentpay' },
    
]
export const ONLY_ALLOWED_PAYMENT_PROVIDERS={
    ideal:['NL'],
    sofort:['DE','AT'],
    interac:['CA'],
    trustly:['NL','FI','DE','PL','DK','AT','SE']
};
export const PAYMENT_CUSTOM_ROUTES = {
    failure_url: "https://cashbackcasino.com/payment/failure",
    pending_url: "https://cashbackcasino.com/payment/pending",
    success_url: "https://cashbackcasino.com/payment/success",
    support_url: "/support"
}

export const TRANSACTION_TYPES = {
    DEPOSIT: "deposit",
    WITHDRAWAL: "withdrawal"
}

export const SORT_PAYMENT_METHODS={
    DE:['sofort','trustly','creditcard','online_bank_transfer','eco_payz','neosurf'],
    NL:['ideal','trustly','creditcard','online_bank_transfer','neteller','skrill','eco_payz','neosurf'],
    CA:['interac','iDebit','creditcard','online_bank_transfer','neteller','skrill','eco_payz','neosurf'],
    DK:['trustly','creditcard','online_bank_transfer','neteller','skrill','eco_payz','neosurf'],
    FI:['trustly','creditcard','online_bank_transfer','skrill','neteller','eco_payz','neosurf']
}



export const RESTRICTED_COUNTRIES=[
    // { country:'IN'},
    // { country:'US'},
    { country:'UK'},
    { country:'BE'},
    { country:'GR'},
    { country:'NL'},
]