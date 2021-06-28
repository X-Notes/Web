import { FontSizeENUM } from 'src/app/shared/enums/font-size.enum';
import { LanguagesENUM } from 'src/app/shared/enums/languages.enum';
import { ThemeENUM } from 'src/app/shared/enums/theme.enum';
import { Background } from '../models/background.model';
import { PersonalizationSetting } from '../models/personalization-setting.model';
import { User } from '../models/user.model';

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

export class LoadPersonalization {
  static type = '[User] load personalization';
}

export class UpdatePersonalization {
  static type = '[User] update personalization';

  constructor(public settings: PersonalizationSetting) {}
}
