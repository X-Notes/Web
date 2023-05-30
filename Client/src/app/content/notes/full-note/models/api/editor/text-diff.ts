import { BaseText } from "src/app/content/notes/models/editor-models/base-text";
import { ContentTypeENUM } from "src/app/content/notes/models/editor-models/content-types.enum";
import { HeadingTypeENUM } from "src/app/content/notes/models/editor-models/text-models/heading-type.enum";
import { NoteTextTypeENUM } from "src/app/content/notes/models/editor-models/text-models/note-text-type.enum";
import { TextBlock } from "src/app/content/notes/models/editor-models/text-models/text-block";

export class TextDiff {
    id: string;

    typeId: ContentTypeENUM;

    order: number;

    headingTypeId?: HeadingTypeENUM;

    noteTextTypeId: NoteTextTypeENUM;

    checked?: boolean;

    contents: TextBlock[];

    initFrom(text: BaseText) : TextDiff {
        this.id = text.id;
        this.typeId =  text.typeId;
        this.order = text.order;
        this.headingTypeId = text.headingTypeId;
        this.noteTextTypeId = text.noteTextTypeId;
        this.checked = text.checked;
        this.contents = text.contents;
        return this;
    }
}