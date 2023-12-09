import { BaseText } from "../contents/base-text";
import { TextBlock } from "../contents/text-models/text-block";
import { TextMetadata } from "../contents/text-models/text-metadata";


export class TextDiff {
    id: string;

    contentMetadata: TextMetadata;
    
    contents: TextBlock[];

    initFrom(text: BaseText) : TextDiff {
        this.id = text.id;
        this.contentMetadata = new TextMetadata(text.metadata.noteTextTypeId, text.metadata.hTypeId, text.metadata.checked, text.metadata.tabCount);
        this.contents = text.contents;
        return this;
    }
}