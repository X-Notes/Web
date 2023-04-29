/* eslint-disable @typescript-eslint/member-ordering */
import {
  NotificationMessagesEnum,
  NotificationMessagesStrEnum,
} from './notification-messages.enum';
import { NotificationMetadata } from './notification-metadata';

export class AppNotification {
  id: string;

  userFromId: string;

  userFromName: string;

  userFromPhotoPath: string;

  isSystemMessage: boolean;

  isRead: boolean;

  notificationMessagesId: NotificationMessagesEnum;

  additionalMessage: string;

  metadata: NotificationMetadata;

  date: Date;

  constructor(ent: Partial<AppNotification>) {
    Object.assign(this, ent);
    this.date = new Date(ent.date);
  }

  get message(): string {
    return NotificationMessagesStrEnum[NotificationMessagesEnum[this.notificationMessagesId]];
  }

  getShowNoteTitle(): boolean {
    switch (this.notificationMessagesId) {
      case NotificationMessagesEnum.ChangeUserPermissionNoteV1:
        return this.metadata && !!this.metadata.noteId;
      case NotificationMessagesEnum.SentInvitesToNoteV1:
        return this.metadata && !!this.metadata.noteId;
      case NotificationMessagesEnum.RemoveUserFromNoteV1:
        return this.metadata && !!this.metadata.noteId;
      default:
        return false;
    }
  }

  getShowFolderTitle(): boolean {
    switch (this.notificationMessagesId) {
      case NotificationMessagesEnum.ChangeUserPermissionFolderV1:
        return this.metadata && !!this.metadata.folderId;
      case NotificationMessagesEnum.SentInvitesToFolderV1:
        return this.metadata && !!this.metadata.folderId;
      case NotificationMessagesEnum.RemoveUserFromFolderV1:
        return this.metadata && !!this.metadata.folderId;
      default:
        return false;
    }
  }

  get isNoteLinkActive(): boolean {
    switch (this.notificationMessagesId) {
      case NotificationMessagesEnum.ChangeUserPermissionNoteV1:
        return this.metadata && !!this.metadata.noteId;
      case NotificationMessagesEnum.SentInvitesToNoteV1:
        return this.metadata && !!this.metadata.noteId;
      default:
        return false;
    }
  }

  get isFolderLinkActive(): boolean {
    switch (this.notificationMessagesId) {
      case NotificationMessagesEnum.ChangeUserPermissionFolderV1:
        return this.metadata && !!this.metadata.folderId;
      case NotificationMessagesEnum.SentInvitesToFolderV1:
        return this.metadata && !!this.metadata.folderId;
      default:
        return false;
    }
  }
}
