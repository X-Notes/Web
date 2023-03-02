import { HeadingTypeENUM } from '../../content-editor/text/heading-type.enum';
import { NoteTextTypeENUM } from '../../content-editor/text/note-text-type.enum';

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
