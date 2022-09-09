import { EntitiesSizeENUM } from 'src/app/shared/enums/font-size.enum';
import { LanguagesENUM } from 'src/app/shared/enums/languages.enum';
import { ThemeENUM } from 'src/app/shared/enums/theme.enum';
import { Background } from '../background.model';
import { BillingPlanId } from '../billing/billing-plan-id.enum';

export interface ShortUser {
  id: string;
  name: string;
  email: string;
  photoId?: string;
  photoPath: string;
  currentBackground: Background;
  languageId: LanguagesENUM;
  themeId: ThemeENUM;
  fontSizeId: EntitiesSizeENUM;
  billingPlanId: BillingPlanId;
}
