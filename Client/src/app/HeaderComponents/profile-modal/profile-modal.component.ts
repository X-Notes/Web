import { Component, OnInit, Input } from '@angular/core';
import { User } from 'src/app/Models/User/User';

@Component({
  selector: 'app-profile-modal',
  templateUrl: './profile-modal.component.html',
  styleUrls: ['./profile-modal.component.sass']
})
export class ProfileModalComponent implements OnInit {

  @Input() user: User;

  constructor() { }

  ngOnInit() {
  }

}
