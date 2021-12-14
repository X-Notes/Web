import { HeadingTypeENUM, NoteTextTypeENUM } from '../../models/editor-models/base-text';

export interface TransformContent {
  id: string;
  textType?: NoteTextTypeENUM;
  headingType?: HeadingTypeENUM;
  setFocusToEnd: boolean;
  isBold?: boolean;
  isItalic?: boolean;
}
