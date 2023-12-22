import { EntityType } from 'src/app/shared/enums/entity-types.enum';
import { AppNotification } from '../models/notifications/app-notification.model';
import { EditorElementsCount } from '../models/editor/editor-elements.count';

export class UpdateDragMuuriState {
  static type = '[App] Drag Muuri State';

  constructor(public active: boolean) {}
}

export class UpdateAppRoute {
  static type = '[App] Update route';

  constructor(public type: EntityType) {}
}

export class Ping {
  static type = '[App] Ping';
  
  constructor(public connectionId: string) {}
}

export class LoadNotifications {
  static type = '[App] Load Notifications';
}

export class ReadAllNotifications {
  static type = '[App] Read all Notifications';
}

export class ReadNotification {
  static type = '[App] Read Notification';

  constructor(public id: string) {}
}

export class NewNotification {
  static type = '[App] New Notification';

  constructor(public notification: AppNotification) {}
}

export class ShowSnackNotification {
  static type = '[App] Show Snack Notification';

  constructor(public notification: string, public duration?: number) {}
}

export class UpdateEditorElementsCount {
  static type = '[App] Update editor elements count';

  constructor(public editorElements: EditorElementsCount) {}
}

export class UpdateEditorSyncStatus {
  static type = '[App] Update editor sync status';

  constructor(public status: boolean) {}
}

