import { HeadingTypeENUM, NoteTextTypeENUM } from './ContentModel';

export interface TransformContent {
  id: string;
  textType: NoteTextTypeENUM;
  headingType?: HeadingTypeENUM;
  setFocusToEnd: boolean;
}
