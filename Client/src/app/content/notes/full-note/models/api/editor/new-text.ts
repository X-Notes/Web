import { ContentTypeENUM } from "src/app/content/notes/models/editor-models/content-types.enum";
import { NoteTextTypeENUM } from "src/app/content/notes/models/editor-models/text-models/note-text-type.enum";
import { TextBlock } from "src/app/content/notes/models/editor-models/text-models/text-block";

export interface NewText {
    id: string;
    noteTextTypeId: NoteTextTypeENUM;
    order: number;
    typeId: ContentTypeENUM;
    contents: TextBlock[];
}