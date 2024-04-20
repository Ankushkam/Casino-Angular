import { GamesService } from './../home/games/games.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DepositsComponent } from './../../modules/users/payments/deposits/deposits.component';
import { IGameProvider, ICollection } from './../../core/interfaces/games';
import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { SharedService, AuthService, ModalService, HttpService } from 'src/app/core/services';
import { LoginComponent } from 'src/app/modules/auth/login/login.component';
import { Meta, Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { APIS, GAMES_LIST, MODALS } from 'src/app/common/constants';
import { PayNPlayModalComponent } from 'src/app/modules/shared/pay-n-play-modal/pay-n-play-modal.component';

@Component({
  selector: 'app-how-it-work',
  templateUrl: './how-it-work.component.html',
  styleUrls: ['./how-it-work.component.scss']
})
export class HowItWorkComponent implements OnInit {
  providers: IGameProvider[];
  GAME_LIST = { ...GAMES_LIST }
  depositMoney=this.translate.instant('links_text.deposit_money');
  allGames: any;
  gameCollection: ICollection[];
  subscriptions: Array<Subscription> = [];
  content1: string = "";
  content2: string = "";
  isPNPAllowed: boolean;
  constructor(
    private ngModal: NgbModal,
    private gameService: GamesService,
    private sharedService: SharedService,
    private authService:AuthService,
    private modalService:ModalService,
    private titleService:Title,
    private translate:TranslateService,
    private httpService:HttpService,
    private metaService:Meta
  ) { }

  ngOnInit(): void {
    this.titleService.setTitle(this.translate.instant("page_titles.how_it_works"))
    this.getCMSData('how-it-works');
    this.subscriptions[0] = this.sharedService.snippets.subscribe(res=>{
      this.content1 = res.find(snippet => snippet.id == "how-it-work-1")?.content || "";
      this.content2 = res.find(snippet => snippet.id == "how-it-work-2")?.content || "";
    });
    this.gameService.updateList.subscribe(res => {
      if (res&& this.sharedService.currentIP.value.country_code !== 'US') {
        this.providers = this.gameService.providers;
        this.allGames = this.gameService.allGames;
      }
    })
    this.sharedService.pnpAlowed.subscribe(res=>{
      this.isPNPAllowed=res;
    });
    this.onLanguageChange();
  }

  openDeposits() {
    let isLoggedIn=this.authService.isAuthenticated();
    if(isLoggedIn) {
      if (this.isPNPAllowed) {
        let modalRef = this.ngModal.open(PayNPlayModalComponent, {
          size: 'md',
          keyboard: false,
          windowClass: 'pnp-modal',
          centered: true
        });
        modalRef.componentInstance.type = MODALS.DEPOSIT;
      } else {
    const depositsModal = this.ngModal.open(DepositsComponent, {
      size: 'lg',
      keyboard: false,
      windowClass: 'modal-active'
    });
  }
  } else {
    if(this.isPNPAllowed) {
      let modalRef=this.ngModal.open(PayNPlayModalComponent, {
        size: 'md',
        keyboard: false,
        windowClass: 'pnp-modal',
        centered: true
      });
      modalRef.componentInstance.type=MODALS.LOGIN;
    } else {
    this.modalService.openModal(LoginComponent);
    }
  }
  }

  onLanguageChange() {
    this.titleService.setTitle(this.translate.instant("page_titles.how_it_works"));
    this.depositMoney=this.translate.instant('links_text.deposit_money');
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub =>{
        sub.unsubscribe();
    });
  }

  getCMSData(page) {
    this.httpService.getData(`${APIS.CMS.PAGES}/${page}`).subscribe(res=>{
      let data=res.body;
      this.titleService.setTitle(data.blocks.title||this.translate.instant("page_titles.how_it_works"))
      if(data.blocks){
        this.metaService.updateTag( { name: 'keywords', content: data.blocks.keywords || this.translate.instant("page_titles.how_it_works")})
        this.metaService.updateTag( { name: 'description', content: data.blocks.description || this.translate.instant("page_titles.how_it_works") })
    }
    });
  }
}
