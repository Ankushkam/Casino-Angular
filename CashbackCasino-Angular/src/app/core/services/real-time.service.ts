import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { APIS } from 'src/app/common/constants';
import { arrayFlat } from 'src/app/common/utils';
import { Centrifuge } from 'centrifuge-ts';

@Injectable({
    providedIn: 'root'
})
export class RealTimeService {
    data:any = { config: {}, user: ''};
    wait_channels:Array<any> = [];
    channels:Array<any> = [];
    centrifuge:any;
    constructor(private httpService: HttpService ) {}

    init () {
        let ready_channels = arrayFlat([...this.channels, ...this.wait_channels], Infinity);
        this.channels = [];
        this.wait_channels = [];

        if (this.centrifuge) {
            this.centrifuge.disconnect();
        }
        this.centrifuge = new Centrifuge(this.data.config);
        console.log(this.centrifuge);
        for(var key in ready_channels) {
            this.subscribe(ready_channels[key].channel, ready_channels[key].callback);
        }

        this.centrifuge.connect();
    };

    get_config () {
        this.httpService.getData(APIS.PLAYER.SETTINGS).subscribe((resp)=>{
            let config = resp.body;
            this.data.config = config.cent;
            this.data.user=config.cent.user;
            this.init();
        });
    }

    subscribe (channel, callback) {
        if (!this.centrifuge || (channel[channel.length - 1] == '#' && this.data.config.user == '')) {
            this.wait_channels.push({channel: channel, callback: callback});
        } else {
            var full_channel_name = channel;
            if (channel[channel.length - 1] == '#') {
                full_channel_name = channel + this.data.config.user;
            }
            this.centrifuge.subscribe(full_channel_name, callback);
            this.channels.push({channel: channel, callback: callback});
        }
    }
}