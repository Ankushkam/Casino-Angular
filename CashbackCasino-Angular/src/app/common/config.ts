import { ISidebarItem } from './../core/interfaces/sidebar-item';

export const SIDEBAR_ITEMS: ISidebarItem[] = [
  {
    icon: 'assets/img/icons/casino_icon.svg',
    name: 'casino',
    link: '/casino'
  },
  {
    icon: 'assets/img/icons/cards_icon.svg',
    name: 'live_casino',
    link: '/live-casino'
  },
  {
    icon: 'assets/img/icons/jackport_icon.svg',
    name: 'jackpots',
    link: '/jackpot'
  },
  // {
  //   icon: 'assets/img/icons/bonus_icon.svg',
  //   name: 'Bonuses',
  //   link: [{ outlets: { modal: 'bonuses' } }]//JSON.parse('[{"outlets":{"'+this.olet+'":["'+this.link+'"]}}]')
  // },
  {
    icon: 'assets/img/icons/bonus_icon.svg',
    name: 'promotions',
    link: '/promotions'
  },
  // {
  //   icon: 'assets/img/icons/loyality_icon.svg',
  //   name: 'loyalty_program',
  //   link: '/loyalty-program'
  // },
  // {
  //   icon: 'assets/img/icons/Tournaments.svg',
  //   name: 'tournaments',
  //   link: '/tournaments'
  // },
  {
    icon: 'assets/img/icons/payment_icon.svg',
    name: 'payment_methods',
    link: '/payment-methods'
  },
  {
    icon: 'assets/img/icons/work_icon.svg',
    name: 'how_it_works',
    link: '/how-it-work'
  }
]

