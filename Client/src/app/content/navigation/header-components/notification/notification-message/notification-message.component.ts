import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AppNotification } from 'src/app/core/models/notifications/app-notification.model';

@Component({
  selector: 'app-notification-message',
  templateUrl: './notification-message.component.html',
  styleUrls: ['./notification-message.component.scss'],
})
export class NotificationMessageComponent {
  @Input() message: AppNotification;

  @Input() isRead: boolean;

  @Output() clickNoteEvent = new EventEmitter<string>();

  @Output() clickFolderEvent = new EventEmitter<string>();

  photoError = false;

  get title(): string {
    const title = this.message.metadata?.title;
    if (title?.length > 25) {
      return title.slice(0, 25) + '...';
    }
    return title;
  }

  clickNoteLink(): void {
    if (this.message.isNoteLinkActive) {
      this.clickNoteEvent.emit(this.message.metadata.noteId);
    }
  }

  clickFolderLink(): void {
    if (this.message.isFolderLinkActive) {
      this.clickFolderEvent.emit(this.message.metadata.noteId);
    }
  }
}
