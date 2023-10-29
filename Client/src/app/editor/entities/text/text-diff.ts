import { BaseText } from "../contents/base-text";
import { ContentTypeENUM } from "../contents/content-types.enum";
import { TextBlock } from "../contents/text-models/text-block";
import { TextMetadata } from "../contents/text-models/text-metadata";


export class TextDiff {
    id: string;

    typeId: ContentTypeENUM;

    order: number;

    contentMetadata: TextMetadata;
    
    contents: TextBlock[];

    initFrom(text: BaseText) : TextDiff {
        this.id = text.id;
        this.typeId =  text.typeId;
        this.order = text.order;
        this.contentMetadata = new TextMetadata(text.metadata.noteTextTypeId, text.metadata.hTypeId, text.metadata.checked, text.metadata.tabCount);
        this.contents = text.contents;
        return this;
    }
}