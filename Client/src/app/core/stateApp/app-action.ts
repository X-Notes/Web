import { EntityType } from 'src/app/shared/enums/entity-types.enum';
import { AppNotification } from '../models/app-notification.model';

export class UpdateRoute {
  static type = '[App] Update route';

  constructor(public type: EntityType) {}
}

export class SetToken {
  static type = '[App] Set Token';

  constructor(public token: string) {}
}

export class TokenSetNoUpdate {
  static type = '[App] Set noUpdateToken';
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

  constructor(public notification: string) {}
}
