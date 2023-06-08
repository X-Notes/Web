import { BaseText } from "../contents/base-text";
import { ContentTypeENUM } from "../contents/content-types.enum";
import { HeadingTypeENUM } from "../contents/text-models/heading-type.enum";
import { NoteTextTypeENUM } from "../contents/text-models/note-text-type.enum";
import { TextBlock } from "../contents/text-models/text-block";


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