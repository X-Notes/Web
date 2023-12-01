import { ContentTypeENUM } from "../contents/content-types.enum";
import { NoteTextTypeENUM } from "../contents/text-models/note-text-type.enum";
import { TextBlock } from "../contents/text-models/text-block";


export interface NewText {
    id: string;
    noteTextTypeId: NoteTextTypeENUM;
    order: number;
    typeId: ContentTypeENUM;
    contents: TextBlock[];
}