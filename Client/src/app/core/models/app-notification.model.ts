export interface AppNotification {
  id: string;
  userFromId: string;
  userFromName: string;
  userFromPhotoPath: string;
  isSystemMessage: boolean;
  isRead: boolean;
  translateKeyMessage: string;
  additionalMessage: string;
  date: Date;
}
