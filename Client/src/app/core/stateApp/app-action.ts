import { EntityType } from 'src/app/shared/enums/EntityTypes';

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

export class LoadGeneralEntites {
  static type = '[App] Load General Entities';
}
