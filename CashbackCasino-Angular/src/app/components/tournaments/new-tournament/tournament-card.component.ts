import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tournament-card',
  templateUrl: './tournament-card.component.html',
  styleUrls: ['./tournament-card.component.scss']
})
export class TournamentCardComponent implements OnInit {

  @Input() tournament;
  @Input() tournamentDate;
  @Input() params;
  @Input() status;
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
