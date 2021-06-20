import { FontSizeENUM } from 'src/app/shared/enums/FontSizeEnum';
import { LanguagesENUM } from 'src/app/shared/enums/LanguagesENUM';
import { ThemeENUM } from 'src/app/shared/enums/ThemeEnum';
import { Background } from '../models/Background';
import { User } from '../models/User';

export class Login {
  static type = '[User] Login User';

  constructor(public token: string, public user: User) {}
}

export class Logout {
  static type = '[User] Logout User';
}

export class ChangeTheme {
  static type = '[User] Change theme';

  constructor(public theme: ThemeENUM) {}
}

export class ChangeLanguage {
  static type = '[User] Change Language';

  constructor(public language: LanguagesENUM) {}
}

export class ChangeFontSize {
  static type = '[User] Change FontSize';

  constructor(public fontSize: FontSizeENUM) {}
}

export class SetCurrentBackground {
  static type = '[User] setCurrent Background';

  constructor(public background: Background) {}
}

export class SetDefaultBackground {
  static type = '[User] setDefault Background';
}

export class UpdateUserName {
  static type = '[User] update userName';

  constructor(public newName: string) {}
}

export class UpdateUserPhoto {
  static type = '[User] update userPhoto';

  constructor(public photo: FormData) {}
}

export class LoadUsedDiskSpace {
  static type = '[User] load used disk space';
}
