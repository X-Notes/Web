export interface AppNotification {
  id: string;
  userFromId: string;
  userFromName: string;
  userFromPhotoPath: string;
  isSystemMessage: boolean;
  isRead: boolean;
  message: string;
  date: Date;
}
