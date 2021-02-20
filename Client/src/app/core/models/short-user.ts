import { LanguageDTO } from 'src/app/shared/enums/Language';
import { Theme } from 'src/app/shared/enums/Theme';
import { FontSize } from 'src/app/shared/enums/FontSize';
import { Background } from './background';

export interface ShortUser {
    name: string;
    photoId: string;
    currentBackground: Background;
    email: string;
    language: LanguageDTO;
    theme: Theme;
    fontSize: FontSize;
}
