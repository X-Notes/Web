import { HeadingTypeENUM } from "src/app/editor/entities/contents/text-models/heading-type.enum";
import { NoteTextTypeENUM } from "src/app/editor/entities/contents/text-models/note-text-type.enum";


export interface TextEditMenuOptions {
  ids: string[];
  isBold: boolean;
  isItalic: boolean;
  textType: NoteTextTypeENUM;
  headingType: HeadingTypeENUM;
  isOneRowType: boolean;
  backgroundColor: string;
  color: string;
}
