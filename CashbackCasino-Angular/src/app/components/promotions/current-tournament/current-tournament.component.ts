import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-current-tournament',
  templateUrl: './current-tournament.component.html',
  styleUrls: ['./current-tournament.component.scss']
})
export class CurrentTournamentComponent implements OnInit {

  @Input() tournament;
  @Input() tournamentDate;
  @Input() params;
  @Input() topWinners;
  constructor(private router:Router) { }

  ngOnInit(): void {
    this.params=JSON.parse(this.params);
  }

  goToLink() {
    this.router.navigate([this.params.link]);
  }
}
