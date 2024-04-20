import { USER_DETAILS } from './../../common/constants';
import { SupportService } from './../../core/services/support.service';
import { IVisitor } from './../../core/interfaces/support';
import { AuthService } from 'src/app/core/services';
import { Component, OnInit, ViewChild } from '@angular/core';
import { LiveChatWidgetApiModel, LiveChatWidgetModel } from '@livechat/angular-widget';

@Component({
  selector: 'app-support',
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.scss']
})
export class SupportComponent implements OnInit {

  public isLiveChatWidgetLoaded: boolean = false;
  public liveChatApi: LiveChatWidgetApiModel;
  public params: { name: string; value: string }[];

  @ViewChild('liveChatWidget', { static: false }) public liveChatWidget: LiveChatWidgetModel;

  visitor = {};
  constructor(
    private authService: AuthService,
    private supportService: SupportService
  ) {

  }

  ngOnInit(): void {
    this.supportService.showChatWindow.subscribe(res => {
      if (res) {
        this.openChatWindow();
      }
    })
    this.authService.authentication.subscribe(res => {
      if (res) {
        this.visitor['name'] = `${this.authService.getUserData(USER_DETAILS.FirstName) || ''} ${this.authService.getUserData(USER_DETAILS.LastName) || ''}`;
        this.visitor['email'] = this.authService.getUserData(USER_DETAILS.Email);
      }

    })
  }


  onChatLoaded(api: LiveChatWidgetApiModel): void {
    this.liveChatApi = api;
    this.isLiveChatWidgetLoaded = true;
  }

  onChatWindowMinimized() {
    console.log('minimized')
  }

  onChatWindowOpened() {
    console.log('opened')
  }

  openChatWindow(): void {
    if (this.isLiveChatWidgetLoaded) {
      this.liveChatWidget.openChatWindow();

      // You can also use methods directly on liveChatApi instance
      // for more details plese read our documentation 
      // https://developers.livechatinc.com/docs/extending-ui/extending-chat-widget/javascript-api/#methods
      // this.liveChatApi.open_chat_window();
    };
  }

  hideChatWindow() {
    if (this.isLiveChatWidgetLoaded) {
      this.liveChatWidget.minimizeChatWindow();

      // You can also use methods directly on liveChatApi instance
      // for more details plese read our documentation 
      // https://developers.livechatinc.com/docs/extending-ui/extending-chat-widget/javascript-api/#methods
      // this.liveChatApi.minimize_chat_window();
    };
  }
}
