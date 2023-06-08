import { HeadingTypeENUM } from "../entities/contents/text-models/heading-type.enum";
import { NoteTextTypeENUM } from "../entities/contents/text-models/note-text-type.enum";


export interface TransformContent {
  contentId: string;
  textType?: NoteTextTypeENUM;
  headingType?: HeadingTypeENUM;
  setFocusToEnd: boolean;
}
