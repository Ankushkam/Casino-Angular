import { Injectable } from '@angular/core';
import { APIS } from 'src/app/common/constants';
import { HttpService } from './http.service';
import * as _ from 'lodash';
import { SharedService } from './shared.service';

@Injectable({
  providedIn: 'root'
})
export class RestrictionsService {
  allRestrictions=[];
  userRestrictons=[];
  providers=[];
  games=[];
  currencies=[];
  gameCurrencies=[];
  constructor(private httpService:HttpService,private sharedService:SharedService) { }

  applyRestrictions(){
    this.httpService.getData(APIS.PLAYER.RESTRICTIONS).subscribe((restrictons)=>{
      this.allRestrictions=restrictons?.body;
      this.httpService.getData(APIS.PLAYER.RESTRICTION_MARKS).subscribe((marks)=>{
        let userRestrictions=marks?.body?.map(mark => {
          return this.allRestrictions?.find(res=>{
            return res.mark==mark;
          })
        });
        this.userRestrictons=userRestrictions
        this.gameCurrencies=[];
        this.currencies=[];
        this.games=[];
        this.providers=[];
        userRestrictions.forEach(element => {
          if(element?.resource=='game'){
          if(element?.scope.provider){
            this.providers.push(element?.scope?.provider)
          }
          if(element?.scope.identifier){
            this.games.push(...element?.scope.identifier)
          }
          if(element?.scope.currency){
            this.gameCurrencies.push(...element?.scope.currency)
          }
        }
          if(element?.resource=='currency'){
            this.currencies.push(...element?.scope.code)
          }
          
        });
        this.sharedService.allCurrencies=this.restrictUserCurrencies(this.sharedService.allCurrencies,this.currencies);
        this.sharedService.updateData(true);
      })
    })
  }

  getRestrictions(marks){
    let userRestrictions=marks?.map(mark => {
      return this.allRestrictions?.find(res=>{
        return res.mark==mark;
      })
    });
    this.userRestrictons=userRestrictions
    this.gameCurrencies=[];
    this.currencies=[];
    this.games=[];
    this.providers=[];
    userRestrictions.forEach(element => {
      if(element?.resource=='game'){
        if(element?.scope.provider){
          this.providers.push(element?.scope?.provider)
        }
        if(element?.scope.identifier){
          this.games.push(...element?.scope.identifier)
        }
        if(element?.scope.currency){
          this.gameCurrencies.push(...element?.scope.currency)
        }
      }
      if(element?.resource=='currency'){
        this.currencies.push(...element?.scope.code)
      }
    });
    this.sharedService.allCurrencies=this.restrictUserCurrencies(this.sharedService.allCurrencies,this.currencies);
    this.sharedService.updateData(true);
  }

  restrictGames(games){
    let keys=Object.keys(games);
    this.games?.forEach((game)=>{
      if(keys.find(key=>{return key==game.replace(':','/')})){
        delete games[game]
      }
    })
    if(this.gameCurrencies.length>0){
    games=this.restrictGameCurrencies(games,this.gameCurrencies);
    }
    return games;
  }

  restrictProviders(providers){
    let filteredproviders=providers.filter((provider)=>{
      return this.providers.find(element => element==provider?.id)?false:true
    })
    return filteredproviders;
  }

  restrictGameCurrencies(games,currencies){
    if(games){
    _.each(games, function(value, key){
        value['real']=_.omit(value['real'], currencies);;
  });
  }
    return games;
  }

  restrictUserCurrencies(allCurrencies,currencies){
    if(allCurrencies && currencies){
    allCurrencies= _.filter(allCurrencies, function(value, key){
        return !currencies.find((ele)=>{ return ele==value['code'] || ele==value['currency']})
  });
  }
    return allCurrencies;
  }
}
