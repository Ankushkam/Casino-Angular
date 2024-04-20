export const BONUSES=[
    {
      "id": 8,
      "title": "Registration",
      "amount_cents": 100,
      "currency": "EUR",
      "stage": "handle_bets",
      "strategy": "registration",
      "amount_wager_requirement_cents": 3000,
      "amount_wager_cents": 100,
      "created_at": "2020-05-29T10:40:26.718Z",
      "activatable_until": null,
      "valid_until": "2020-08-29T10:40:26.718Z",
      "activatable": false,
      "cancelable": true
    },
    {
      "id": 14,
      "title": "Bonus with activation",
      "amount_cents": 100,
      "currency": "EUR",
      "stage": "issued",
      "strategy": "deposit",
      "amount_wager_requirement_cents": 3000,
      "amount_wager_cents": 100,
      "created_at": "2020-05-29T10:40:26.718Z",
      "activatable_until": "2020-09-29T10:40:26.719Z",
      "valid_until": null,
      "activatable": true,
      "cancelable": true
    },
    {
      "id": 55,
      "title": "With Games Limit",
      "amount_cents": 80,
      "currency": "EUR",
      "stage": "handle_bets",
      "strategy": "personal",
      "amount_wager_requirement_cents": 10000,
      "amount_wager_cents": 0,
      "created_at": "2020-05-29T10:40:26.718Z",
      "activatable_until": null,
      "valid_until": null,
      "activatable": false,
      "cancelable": true,
      "games_info": [
        {
          "identifier": "softswiss/PlatinumLightning",
          "title": "Platinum Lightning",
          "frontend_url": "platinum-lightning"
        },
        {
          "identifier": "softswiss/CherryFiesta",
          "title": "Cherry Fiesta",
          "frontend_url": "cherry-fiesta"
        }
      ],
      "games": [
        "softswiss/PlatinumLightning",
        "softswiss/CherryFiesta"
      ]
    },
    {
      "id": 12345,
      "title": "For deposit",
      "amount_cents": 50,
      "currency": "USD",
      "stage": "canceled",
      "strategy": "prize",
      "amount_wager_requirement_cents": 20000,
      "amount_wager_cents": 500,
      "created_at": "2020-05-29T10:40:26.718Z",
      "activatable_until": null,
      "valid_until": null,
      "activatable": false,
      "cancelable": false
    }
  ]

  export const FREESPINS=[
    {
      "id": 45,
      "title": "Wild 10",
      "freespins_total": 10,
      "freespins_performed": 3,
      "bet_level": 1,
      "stage": "activated",
      "games": [
        "softswiss/LetItRideFlash",
        "softswiss/ScratchDice"
      ],
      "games_info": [
        {
          "identifier": "softswiss/LetItRideFlash",
          "title": "Let It Ride Flash",
          "frontend_url": "let-it-ride-flash"
        },
        {
          "identifier": "softswiss/ScratchDice",
          "title": "Hi-Lo Switch",
          "frontend_url": "hi-lo-switch"
        }
      ],
      "activation_path": "/profile/bonuses/freespins/45/activate",
      "provider": "softswiss",
      "currency": "EUR",
      "created_at": "2020-05-29T10:40:27.092Z",
      "activatable_until": "2020-08-29T10:40:27.092Z",
      "valid_until": null,
      "activatable": false,
      "activation_condition": null,
      "cancelable": true
    },
    {
      "id": 1106,
      "title": "Wild 20",
      "freespins_total": 20,
      "freespins_performed": 2,
      "bet_level": 3,
      "stage": "activated",
      "games": [
        "softswiss/LetItRideFlash",
        "softswiss/SportSlotFlash"
      ],
      "games_info": [
        {
          "identifier": "softswiss/TreyPokerFlash",
          "title": "Trey Poker Flash",
          "frontend_url": "trey-poker-flash"
        },
        {
          "identifier": "softswiss/SportSlotFlash",
          "title": "Sport Slot Flash",
          "frontend_url": "sport-slot-flash"
        }
      ],
      "activation_path": "/profile/bonuses/freespins/1106/activate",
      "provider": "softswiss",
      "currency": "EUR",
      "created_at": "2020-05-29T10:40:27.092Z",
      "activatable_until": null,
      "valid_until": "2020-08-29T10:40:27.092Z",
      "activatable": false,
      "activation_condition": null,
      "cancelable": true
    },
    {
      "id": 2223,
      "title": "Wild 30",
      "freespins_total": 30,
      "freespins_performed": 9,
      "bet_level": 2,
      "stage": "issued",
      "games": [
        "netent/SuperNetentGame"
      ],
      "games_info": [
        {
          "identifier": "netent/SuperNetentGame",
          "title": "Super Netent Game",
          "frontend_url": "super-netent-game"
        }
      ],
      "activation_path": "/profile/bonuses/freespins/2223/activate",
      "provider": "netent",
      "currency": "EUR",
      "created_at": "2020-05-29T10:40:27.092Z",
      "activatable_until": "2020-08-29T10:40:27.092Z",
      "valid_until": null,
      "activatable": false,
      "activation_condition": "player_context:netent",
      "cancelable": true
    }
  ]