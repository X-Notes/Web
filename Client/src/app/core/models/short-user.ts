import { Language } from 'src/app/shared/enums/Language';

export interface ShortUser {
    name: string;
    photoId: string;
    backgroundId: string;
    email: string;
    language: Language;
}
