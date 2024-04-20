import { Component, OnInit, OnDestroy, AfterContentInit } from '@angular/core';
import { HttpService, AuthService } from 'src/app/core/services';
import { APIS } from 'src/app/common/constants';
import { Title, Meta } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { NavigationEnd, Router } from '@angular/router';

@Component({
    selector: 'static-info-pages',
    templateUrl: './static-info-pages.component.html',
    styleUrls: ['./static-info-pages.component.scss']
})
export class StaticInfoPagesComponent implements OnInit,OnDestroy,AfterContentInit {
    data:any;
    title;
    pagePath;
   
    constructor(
        private translate: TranslateService,
        private titleService: Title,
        private metaService: Meta,
        private httpService : HttpService,
        private authService: AuthService,
        private  router:Router
    ) { }
        
    ngOnInit(): void {
        this.pagePath = APIS.CMS.PAGES + this.authService.getPath();
        this.getData();
        this.translate.onLangChange.subscribe((res)=>{
            this.getData();
        })
    }
    ngAfterContentInit(){
        let body = document.getElementsByTagName('body')[0];
        body.scrollTop = 0;
    }

    getData(){
        this.httpService.getData(this.pagePath).subscribe((resp) =>{
            this.data = resp.body;
            if(this.data.blocks){
                this.title=this.data.blocks.title || ""
                this.titleService.setTitle(this.data.blocks.title || "");
                // this.metaService.addTags([
                //     { name: 'keywords', content: this.data.blocks.keywords || "" },
                //     { name: 'description', content: this.data.blocks.description || "" }
                // ]);
                this.metaService.updateTag( { name: 'keywords', content: this.data.blocks.keywords || "Cashback Casino" })
                this.metaService.updateTag( { name: 'description', content: this.data.blocks.description || "Cashback Casino" })
            }
        });
    }

    ngOnDestroy(){
        this.titleService.setTitle("Cashback Casino");
    }
}