import { Component, OnInit, Input } from '@angular/core';
import { User } from 'src/app/Models/User/User';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.sass']
})
export class NotificationComponent implements OnInit {

  @Input() user: User;
  activeSettings = false;

  toggle() {
    this.activeSettings = !this.activeSettings;
  }

  constructor() { }

  ngOnInit() {
  }

}
