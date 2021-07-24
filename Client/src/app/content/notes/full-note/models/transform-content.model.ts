import { HeadingTypeENUM, NoteTextTypeENUM } from '../../models/content-model.model';

export interface TransformContent {
  id: string;
  textType: NoteTextTypeENUM;
  headingType?: HeadingTypeENUM;
  setFocusToEnd: boolean;
}
