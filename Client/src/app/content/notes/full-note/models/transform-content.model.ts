import { HeadingTypeENUM } from '../content-editor/text/heading-type.enum';
import { NoteTextTypeENUM } from '../content-editor/text/note-text-type.enum';

export interface TransformContent {
  id: string;
  textType?: NoteTextTypeENUM;
  headingType?: HeadingTypeENUM;
  setFocusToEnd: boolean;
  isBold?: boolean;
  isItalic?: boolean;
}
