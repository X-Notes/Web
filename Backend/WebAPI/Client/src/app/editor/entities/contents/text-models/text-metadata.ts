import { HeadingTypeENUM } from "./heading-type.enum";
import { NoteTextTypeENUM } from "./note-text-type.enum";

export class TextMetadata {
    constructor(
        public noteTextTypeId: NoteTextTypeENUM,
        public hTypeId?: HeadingTypeENUM,
        public checked?: boolean,
        public tabCount?: number) { }

    isEqual(metadata: TextMetadata): boolean {
        if (this === metadata) return true;
        if (metadata == null) return false;
        
        return (
            this.hTypeId === metadata.hTypeId &&
            this.noteTextTypeId === metadata.noteTextTypeId &&
            this.checked === metadata.checked &&
            this.tabCount === metadata.tabCount
        );
    }
}