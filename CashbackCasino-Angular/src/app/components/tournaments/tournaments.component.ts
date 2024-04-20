import { Component, OnInit } from '@angular/core';
import { APIS } from 'src/app/common/constants';
import { HttpService, SharedService } from 'src/app/core/services';
import { ActivatedRoute } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-tournaments',
  templateUrl: './tournaments.component.html',
  styleUrls: ['./tournaments.component.scss']
})
export class TournamentsComponent implements OnInit {

  tournaments;
  data;
  tournamentId;
  content;
  readMore=false;

  constructor(
    private httpService:HttpService,
    private route:ActivatedRoute,
    private titleService: Title,
    private metaService: Meta,
    private translate:TranslateService
  ) { 
  }

  ngOnInit(): void {
    this.route.params.subscribe(params=>{
      this.tournamentId=params.id;
    });
    this.getCMSData();
    this.translate.onLangChange.subscribe((res)=>{
      this.getCMSData();
    })
  }

  getCMSData() {
    if(this.tournamentId) {
      this.httpService.getData(`${APIS.CMS.PAGES}/tournaments/${this.tournamentId}`).subscribe(res=>{
        this.data=res.body;
        this.content=this.data.content;
        if(this.data.blocks){
          this.titleService.setTitle(this.data.blocks.title || "");
          this.metaService.updateTag( { name: 'keywords', content: this.data.blocks.keywords || "Cashback Casino" })
          this.metaService.updateTag( { name: 'description', content: this.data.blocks.description || "Cashback Casino" })
      }
      })
    } else {
      this.httpService.getData(`${APIS.CMS.PAGES}/tournaments`).subscribe(res=>{
        this.data=res.body;
        this.content=this.data.content;
        if(this.data.blocks){
          this.titleService.setTitle(this.data.blocks.title || "");
          this.metaService.updateTag( { name: 'keywords', content: this.data.blocks.keywords || "Cashback Casino" })
          this.metaService.updateTag( { name: 'description', content: this.data.blocks.description || "Cashback Casino" })
      }
      })
  }
  this.httpService.getData(APIS.TOURNAMENTS.TOURNAMENTS).subscribe((res)=>{
    this.tournaments=res.body;
  })
  }
}
