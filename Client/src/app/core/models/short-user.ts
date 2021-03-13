import { FontSize } from 'src/app/shared/models/FontSize';
import { LanguageDTO } from 'src/app/shared/models/LanguageDTO';
import { Theme } from 'src/app/shared/models/Theme';
import { Background } from './background';

export interface ShortUser {
  name: string;
  email: string;
  photoId: string;
  currentBackground: Background;
  language: LanguageDTO;
  theme: Theme;
  fontSize: FontSize;
}
