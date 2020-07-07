import { Language } from 'src/app/shared/enums/Language';

export interface User {
    name: string;
    photoId: string;
    language: Language;
}
