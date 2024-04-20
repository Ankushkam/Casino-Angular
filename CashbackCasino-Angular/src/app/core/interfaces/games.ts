export interface IGameProvider {
  id: string;
  title: string;
}

export interface IGamesCollection {
  id: string;
  title: string;
}

export interface ICollection {
  id: string;
  title: string;
}

export interface IGames {
  id: number;
  title: string;
  currency: string;
  identifier: string;
  provider: string;
  devices: string[];
  collections: string[];
  play_url: string;
}

export interface IRecentGames {
  identifier: string;
  last_activity_at?: string;
}

export enum Category {
  ALL,
  NEW,
  POPULAR,
  LIVE_CASINO,
  BONUS_BUYS,
  JACKPOT,
  MEGAWAYS,
  EPIC_WINS,
  CLASSIC_FRUIT_MACHINES,
  WIN_BOTH_WAYS,
  CLUSTER_PLAYS
}

export enum Sub_Category {
  LIVE_ALL,
  LIVE_POPULAR,
  BLACKJACK,
  ROULLETE,
  BACCARAT,
  POKER,
  CARD_GAMES,
  OTHERS
}

export const CATEGORY_TABS = [
  { id: 'nav-Games', name: 'game_categories.all_games', src: 'assets/img/icons/aGames_icon.svg' },
  { id: 'nav-nGames', name: 'game_categories.new_games', src: "assets/img/icons/nGame_icon.svg" },
  { id: 'nav-pGames', name: 'game_categories.popular_games', src: "assets/img/icons/pGame_icon.svg" },
  { id: 'nav-lCasino', name: 'game_categories.live_casino', src: "assets/img/icons/lCasino.svg" },
  { id: 'nav-bbGames', name: 'game_categories.bonus_hunt', src: "assets/img/New categories/bonus_hunt.svg" },
  { id: 'nav-jGames', name: 'game_categories.jackpot_games', src: "assets/img/icons/jackpot_icon.svg" },
  { id: 'nav-mGames', name: 'game_categories.megaways', src: "assets/img/New categories/Megaways/18px.svg" },
  { id: 'nav-eCasino', name: 'game_categories.epic_wins_over*10.000', src: "assets/img/New categories/Epic wins over x10.000/18px.svg" },
  { id: 'nav-cGames', name: 'game_categories.classic_fruit_machines', src: "assets/img/New categories/Classic fruit machines/18px.svg" },
  { id: 'nav-wbCasino', name: 'game_categories.win_both_ways', src: "assets/img/New categories/Win both ways/18px.svg" },
  { id: 'nav-clGames', name: 'game_categories.cluster_plays', src: "assets/img/New categories/Cluster plays/18px.svg" }
]

export const SUB_CATEGORY_TABS = [
  { id: 'nav-aaGames', name: 'game_categories.all_games', src: "assets/img/icons/aGames_icon.svg" },
  { id: 'nav-jGames', name: 'game_categories.popular', src: "assets/img/New categories/other_icon.svg" },
  { id: 'nav-blCasino', name: 'game_categories.blackjack', src: "assets/img/icons/lCasino.svg" },
  { id: 'nav-rGames', name: 'game_categories.roulette', src: "assets/img/New categories/roulette_icon.svg" },
  { id: 'nav-baGames', name: 'game_categories.baccarat', src: "assets/img/New categories/baccarat_icon.svg" },
  { id: 'nav-pGames', name: 'game_categories.poker', src: "assets/img/New categories/poker_icon.svg" },
  { id: 'nav-caGames', name: 'game_categories.card_games', src: "assets/img/New categories/live poker and card games/18px.svg" },
  
]

export const USER_GAMES_TABS = [
  { id: 'favGames', name: 'game_categories.favourite_games', src: 'assets/img/icons/fav_icon.svg' },
  { id: 'recentGames', name: 'game_categories.recent_games', src: "assets/img/icons/recent_icon.svg" },
  { id: 'newGames', name: 'game_categories.new_games', src: "assets/img/icons/nGame_icon.svg" },
  { id: 'topGames', name: 'game_categories.top_games', src: "assets/img/icons/tGame_icon.svg" }
]