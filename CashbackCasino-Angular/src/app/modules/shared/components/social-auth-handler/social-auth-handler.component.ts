import { Component, OnInit } from '@angular/core';
import {  Router } from '@angular/router';
import { HttpService } from 'src/app/core/services/http.service';
import { AuthService } from 'src/app/core/services';

@Component({
  selector: 'app-social-auth-handler',
  templateUrl: './social-auth-handler.component.html',
  styleUrls: ['./social-auth-handler.component.scss']
})
export class SocialAuthHandlerComponent implements OnInit {

  constructor(
    private route:Router,
    private httpService:HttpService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.httpService.getData(this.authService.getPath()).subscribe((res)=>{
    })
  }
}
