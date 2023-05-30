import { ContentTypeENUM } from "src/app/content/notes/models/editor-models/content-types.enum";

export interface NewCollection {
    id: string;
    typeId: ContentTypeENUM;
    order: number;
}