import { Component, OnInit, Input } from '@angular/core';
import { User } from 'src/app/Models/User/User';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.sass']
})
export class ProfileComponent implements OnInit {

  @Input() user: User;

  constructor() { }

  ngOnInit() {
  }

}
