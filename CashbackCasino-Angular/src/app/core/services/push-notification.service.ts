
import { Injectable } from '@angular/core';
import { ONE_SIGNAL, USER_DETAILS } from 'src/app/common/constants';
import {Cache} from '../../common/storage.provider' // Decorator to access local storage
import { CookieService } from 'ngx-cookie-service';
import { environment } from 'src/environments/environment';

let OneSignal;
@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {
    
    @Cache({pool: 'OneSignal'}) oneSignalInit; // to check if OneSignal is already initialized. 
    @Cache({pool: 'OneSignal'}) oneSignalId: any; // store OneSignalId in localStorage
    @Cache({pool: 'Token'}) userSession: any; // User Session management token

    
    constructor(private cookieService:CookieService) {
        // console.log('OneSignal Service Init', this.oneSignalInit);
    }
    
    // Call this method to start the onesignal process.
    public init() {
        // this.oneSignalInit ? console.log('Already Initialized') : this.initOneSignal();
        
    }

    initOneSignal() {
        OneSignal = window['OneSignal'] || [];
        OneSignal.sendTag('user_id', this.cookieService.get(USER_DETAILS.OriginalUserId), (tagsSent) => {
            // Callback called when tags have finished sending
            console.log('OneSignal Tag Sent', tagsSent);
        });
        console.log('Init OneSignal');
        OneSignal.push(() =>{
            OneSignal.init({
                // subdomainName:'cashbackcasino',
            appId: environment.oneSignalAppId,
            autoResubscribe: ONE_SIGNAL.CONFIG.AUTO_RESUBSCRIBE,
            notifyButton: {
                enable: false
            },
            allowLocalhostAsSecureOrigin: ONE_SIGNAL.CONFIG.ALLOW_LOCALHOST_SECURE_LOGIN,
            
        });
    })
        console.log('OneSignal Initialized');
        this.checkIfSubscribed();
    }

    subscribe() {
        OneSignal.push(() => {
            console.log('Register For Push');
            OneSignal.push(['registerForPushNotifications'])
            OneSignal.on('subscriptionChange', (isSubscribed) => {
                console.log('The user\'s subscription state is now:', isSubscribed);
                this.listenForNotification();
                OneSignal.getUserId().then((userId) => {
                    console.log('User ID is', userId);
                    this.oneSignalId = userId;
                });
            });
        });
    }

    listenForNotification() {
        console.log('Initalize Listener');
        OneSignal.on('notificationDisplay', (event) => {
            console.log('OneSignal notification displayed:', event);
            this.listenForNotification();
        });
    }

    getUserID() {
        OneSignal.getUserId().then((userId) => {
            console.log('User ID is', userId);
            this.oneSignalId = userId;
        });
    }

    checkIfSubscribed() {
        OneSignal.push(() => {
            OneSignal.isPushNotificationsEnabled((isEnabled) => {
                if (isEnabled) {
                    console.log('Push notifications are enabled!');
                    this.getUserID();
                } else {
                    console.log('Push notifications are not enabled yet.');
                    this.subscribe();
                }
            }, (error) => {
                console.log('Push permission not granted');
            });
        });
    }

    showNotification() {
        OneSignal.sendSelfNotification(
            /* Title (defaults if unset) */
            "OneSignal Web Push Notification",
            /* Message (defaults if unset) */
            "Action buttons increase the ways your users can interact with your notification.", 
             /* URL (defaults if unset) */
            'https://example.com/?_osp=do_not_open',
            /* Icon */
            'https://onesignal.com/images/notification_logo.png',
            {
              /* Additional data hash */
              notificationType: 'news-feature'
            }, 
            // [{ /* Buttons */
            //   /* Choose any unique identifier for your button. The ID of the clicked button is passed to you so you can identify which button is clicked */
            //   id: 'like-button',
            //   /* The text the button should display. Supports emojis. */
            //   text: 'Like',
            //   /* A valid publicly reachable URL to an icon. Keep this small because it's downloaded on each notification display. */
            //   icon: 'http://i.imgur.com/N8SN8ZS.png',
            //   /* The URL to open when this action button is clicked. See the sections below for special URLs that prevent opening any window. */
            //   url: 'https://example.com/?_osp=do_not_open'
            // },
            // {
            //   id: 'read-more-button',
            //   text: 'Read more',
            //   icon: 'http://i.imgur.com/MIxJp1L.png',
            //   url: 'https://example.com/?_osp=do_not_open'
            // }]
          );
    }

}