import { ContentTypeENUM } from "../contents/content-types.enum";


export interface NewCollection {
    id: string;
    typeId: ContentTypeENUM;
    order: number;
}