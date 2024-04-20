import { Component, HostListener, OnInit, ViewEncapsulation } from '@angular/core';
import { HttpService } from 'src/app/core/services';
import { APIS } from 'src/app/common/constants';
import { Router } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-promotions',
  templateUrl: './promotions.component.html',
  styleUrls: ['./promotions.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PromotionsComponent implements OnInit {

  content; 
  data;

  constructor(private httpService:HttpService,private translate:TranslateService,private router:Router,private metaService: Meta,private titleService: Title) { }
  
  ngOnInit(): void {
    
    let screen=document.body;
    screen.addEventListener('scroll', (event) => {  
      if (screen.scrollTop >=0) {
        if(document.getElementsByClassName('move_down_arrow')[0]){
          if(document.getElementsByClassName('move_down_arrow')[0].classList.contains('hide')){
            document.getElementsByClassName('move_down_arrow')[0].classList.remove('hide');
          }
        }
      }  
      if (screen.offsetHeight + screen.scrollTop >= screen.scrollHeight) {  
        if(document.getElementsByClassName('move_down_arrow')[0]){
          document.getElementsByClassName('move_down_arrow')[0].classList.add('hide');
        }
      }  
       
    })
    this.getCMSData();
    this.translate.onLangChange.subscribe((res)=>{
      this.getCMSData();
    })
  }

  

  goTo(link) {
    this.router.navigate([link]);
  }

  getCMSData() {
    this.httpService.getData(`${APIS.CMS.PAGES}/promotions`).subscribe(res=>{
      this.data=res.body;
      this.content=this.data.content;
      if(this.data.blocks){
        this.titleService.setTitle(this.data.blocks.title || "");
        this.metaService.updateTag( { name: 'keywords', content: this.data.blocks.keywords || "Cashback Casino" })
        this.metaService.updateTag( { name: 'description', content: this.data.blocks.description || "Cashback Casino" })
      }
    });
  }

  ngOnChange(){
    let screen=document.body;
    screen.addEventListener('scroll', (event) => {  
      if (screen.scrollTop>=0) {
        if(document.getElementsByClassName('move_down_arrow')[0]){
          if(document.getElementsByClassName('move_down_arrow')[0].classList.contains('hide')){
            document.getElementsByClassName('move_down_arrow')[0].classList.remove('hide');
          }
        }
      }  
      if (screen.offsetHeight + screen.scrollTop >= screen.scrollHeight) {  
        // console.log('scrolled to bottom') ;
        if(document.getElementsByClassName('move_down_arrow')[0]){
          document.getElementsByClassName('move_down_arrow')[0].classList.add('hide');
        }
      }  
       
    })
  }

  scrollToBottom(){
    let screen=document.body;
    console.log("=======I am IN======")
    screen.scrollTo(0, document.body.scrollHeight);
  }

}
