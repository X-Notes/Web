import { FontSizeENUM } from 'src/app/shared/enums/FontSizeEnum';
import { LanguagesENUM } from 'src/app/shared/enums/LanguagesENUM';
import { ThemeENUM } from 'src/app/shared/enums/ThemeEnum';
import { Background } from './Background';

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
}
