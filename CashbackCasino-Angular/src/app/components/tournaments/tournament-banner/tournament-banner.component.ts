import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tournament-banner',
  templateUrl: './tournament-banner.component.html',
  styleUrls: ['./tournament-banner.component.scss']
})
export class TournamentBannerComponent implements OnInit {

  @Input() tournament;
  @Input() tournamentDate;
  @Input() params;
  constructor(
    private router:Router
  ) { }

  ngOnInit(): void {
    this.params=JSON.parse(this.params);
  }

  goToRoute() {
    this.router.navigate([this.params.link]);
  }

}
