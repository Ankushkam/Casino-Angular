export interface IWinner {
  game_identifier: string;
  game_title: string;
  game_table_url: string;
  game_table_image_path: string;
  currency: string;
  bet_amount_cents: number;
  win_amount_cents: number;
  humanized_win: string;
  at: number;
  nickname: string;
}

export enum WINNER_TYPE {
  TOP = 'top',
  LATEST = 'latest'
}