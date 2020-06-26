import { Component, OnInit, Input } from '@angular/core';
import { User } from 'src/app/Models/User/User';

@Component({
  selector: 'app-invites',
  templateUrl: './invites.component.html',
  styleUrls: ['./invites.component.sass']
})
export class InvitesComponent implements OnInit {

  @Input() user: User;

  toggleInvites = true;

  constructor() { }

  ngOnInit() {
  }

}
