import { Component, OnInit, Input } from '@angular/core';
import { environment } from 'src/environments/environment';
import { LoaderService } from 'src/app/core/services/loader.service';

@Component({
  selector: 'app-tournament-header',
  templateUrl: './tournament-header.component.html',
  styleUrls: ['./tournament-header.component.scss']
})
export class TournamentHeaderComponent implements OnInit {

  @Input() tournament;
  @Input() tournamentDate;
  @Input() params;
  
  constructor(private loader:LoaderService) { }

  ngOnInit(): void {
    // this.loader.show();
    this.params=JSON.parse(this.params);
    // setTimeout(()=>{
    //   this.loader.hide();
    // },3000);
  }

  getImageURL() {
    return `${environment.imgBaseURL}${this.params.img}`;
  }

}
