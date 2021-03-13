import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
})
export class NotificationComponent implements OnInit {
  @Output() oncloseNotification = new EventEmitter();

  notification = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  toggleMessage = true;

  constructor() {}

  ngOnInit(): void {}

  closeNotification() {
    this.oncloseNotification.emit();
  }
}
