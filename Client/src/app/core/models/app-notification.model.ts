export interface AppNotification {
  id: string;
  userFromPhotoId: string;
  userFromName: string;
  isSystemMessage: boolean;
  isRead: boolean;
  message: string;
  date: Date;
}
