import { EntitiesSizeENUM as EntitiesSizeENUM } from 'src/app/shared/enums/font-size.enum';
import { LanguagesENUM } from 'src/app/shared/enums/languages.enum';
import { ThemeENUM } from 'src/app/shared/enums/theme.enum';
import { Background } from '../models/background.model';
import { BillingPlanId } from '../models/billing/billing-plan-id.enum';
import { PersonalizationSetting } from '../models/personalization-setting.model';

export class Auth {
  static type = '[User] Auth User';
}

export class Logout {
  static type = '[User] Logout User';
  constructor(public refreshToken: string){}
}

export class ChangeTheme {
  static type = '[User] Change theme';

  constructor(public theme: ThemeENUM) {}
}

export class ChangeLanguage {
  static type = '[User] Change Language';

  constructor(public language: LanguagesENUM) {}
}

export class ChangeEntitiesSize {
  static type = '[User] Change Entities size';

  constructor(public fontSize: EntitiesSizeENUM) {}
}

export class SetCurrentBackground {
  static type = '[User] setCurrent Background';

  constructor(public background: Background) {}
}

export class SetDefaultBackground {
  static type = '[User] setDefault Background';
}

export class UpdateUserInfo {
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

export class LoadBillingPlans {
  static type = '[User] load billing plans';
}

export class UpdateBillingUserPlan {
  static type = '[User] update billing plan';

  constructor(public billingPlan: BillingPlanId) {}
}

export class LoadPersonalization {
  static type = '[User] load personalization';
}

export class UpdatePersonalization {
  static type = '[User] update personalization';

  constructor(public settings: PersonalizationSetting) {}
}
