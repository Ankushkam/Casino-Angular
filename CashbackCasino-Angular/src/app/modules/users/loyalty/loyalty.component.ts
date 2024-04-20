import { Component, OnInit } from '@angular/core';
import { HttpService, SharedService, AuthService } from 'src/app/core/services';
import { APIS } from 'src/app/common/constants';
import { CurrentLevel } from 'src/app/core/interfaces';
import { Subscription } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'loyalty',
    templateUrl: './loyalty.component.html',
    styleUrls: ['./loyalty.component.scss']
})
export class LoyaltyComponent implements OnInit {
    show: boolean = false;
    levels: Array<any> = [];
    viplevels: Array<any> = [];
    alllevels: Array<any> = [];
    snippets: Array<any> = [];
    totalPoints: number = 0;
    currentLevel: CurrentLevel;
    previousLevel:CurrentLevel;
    subscriptions: Array<Subscription> = [];
    isLoginUser: boolean;
    loyaltyContent: string = "";
    loyaltyTopContent: string="";
    constructor(private httpService: HttpService, private sharedService: SharedService,private titleService:Title,private translate: TranslateService,private authService: AuthService) {}
    
    ngOnInit(): void {
        this.titleService.setTitle(this.translate.instant('page_titles.loyalty_program'))
        this.authService.authentication.subscribe((res) => {
            this.isLoginUser = !!res;
        });
        this.subscriptions[0] = this.sharedService.currentLevel$.subscribe(res=>{
            this.currentLevel = res;
            this.currentLevel.level=this.currentLevel?.type=='vip'?this.currentLevel?.type:this.currentLevel?.level
            this.totalPoints =  res.points;
        });
        this.subscriptions[2] = this.sharedService.previousLevel$.subscribe(res=>{
            this.previousLevel = res;
        });
        this.subscriptions[1] = this.sharedService.snippets.subscribe(res=>{
            this.snippets = res;
            this.loyaltyContent = res.find(snippet => snippet.id == "loyalty-program")?.content || "";
            this.loyaltyTopContent = res.find(snippet => snippet.id == "loyalty-program-header")?.content || "";
            this.httpService.getData(APIS.GROUPS).subscribe(resp =>{
                this.levels =  resp.body.filter(obj => obj.id.includes('level_') && obj.conditions.length).map(obj => { return { ...obj,
                    requiredPoints: obj.conditions[0].persistent_comp_points.min,
                    // levelImage: obj.conditions[0].persistent_comp_points.min  <= this.totalPoints && this.isLoginUser ? `${obj.id}.svg` : 'unlock_box.png',
                    levelImage: obj.conditions[0].persistent_comp_points.min  <= this.totalPoints? `${obj.id}.svg` : 'unlock_box.png',
                    disabled : obj.conditions[0].persistent_comp_points.min  > this.totalPoints || !this.isLoginUser,
                    offers:this.snippets.find(snippet => snippet.id == obj.id)?.content ? JSON.parse(this.snippets.find(snippet => snippet.id == obj.id)?.content):{}
                    // offers: this.snippets.find(snippet => snippet.id == obj.id)
                }}).sort((a, b) => a.id.substr(6) - b.id.substr(6));
    
                this.viplevels=resp.body.filter(obj => obj.id.includes('vip_') && obj.conditions.length).map(obj => { return { ...obj,
                    requiredPoints: obj.conditions[0].persistent_comp_points.min,
                    levelImage: obj.conditions[0].persistent_comp_points.min  <= this.totalPoints? `${obj.id}.svg` : 'unlock_box.png',
                    disabled : obj.conditions[0].persistent_comp_points.min  > this.totalPoints || !this.isLoginUser,
                    offers:this.snippets.find(snippet => snippet.id == obj.id)?.content ? JSON.parse(this.snippets.find(snippet => snippet.id == obj.id)?.content):{}           
                }}).sort((a, b) => a.id.substr(4) - b.id.substr(4));
                this.alllevels=this.levels.concat(this.viplevels);
            });

            if(this.currentLevel.maxPoints==0){
                let level1=this.alllevels.find((res)=>{
                    return res.id=='level_1'
                })
                if(level1)
                this.currentLevel.maxPoints=level1.requiredPoints;
            }
        });  

    }

    ngOnDestroy() {
        this.subscriptions.forEach(sub =>{
            sub.unsubscribe();
        });
    }    
}