import { Background } from './Background';

export interface FullUser {
    name: string;
    email: string;
    photoId: string;
    BackgroundsId: Background[];
}
