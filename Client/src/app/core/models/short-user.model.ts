import { BillingENUM } from 'src/app/shared/enums/billing.enum';
import { FontSizeENUM } from 'src/app/shared/enums/font-size.enum';
import { LanguagesENUM } from 'src/app/shared/enums/languages.enum';
import { ThemeENUM } from 'src/app/shared/enums/theme.enum';
import { Background } from './background.model';

export interface ShortUser {
  id: string;
  name: string;
  email: string;
  photoId: string;
  photoPath: string;
  currentBackground: Background;
  languageId: LanguagesENUM;
  themeId: ThemeENUM;
  fontSizeId: FontSizeENUM;
  billingPlanId: BillingENUM;
}
