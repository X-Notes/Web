import { LanguageDTO } from 'src/app/shared/enums/Language';

export interface User {
    name: string;
    photo: FormData;
    language: LanguageDTO;
}
