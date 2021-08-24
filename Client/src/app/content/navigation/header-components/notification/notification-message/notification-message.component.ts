import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-notification-message',
  templateUrl: './notification-message.component.html',
  styleUrls: ['./notification-message.component.scss'],
})
export class NotificationMessageComponent {
  @Input() message: Record<string, string>;

  @Input() isRead: boolean;

  photoError = false;

  get typeMessage() {
    switch (this.message.message) {
      case 'notification.ChangeUserPermissionNote':
        return 'notification.ChangeUserPermissionNote';
      default:
        return null;
    }
  }
}
