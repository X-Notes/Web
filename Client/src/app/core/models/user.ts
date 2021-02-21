import { LanguageDTO } from 'src/app/shared/models/Language';

export interface User {
    name: string;
    photo: FormData;
    language: LanguageDTO;
}
