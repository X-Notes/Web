import { ParentInteractionHTML } from "../components/parent-interaction.interface";
import { HeadingTypeENUM } from "../entities/contents/text-models/heading-type.enum";
import { NoteTextTypeENUM } from "../entities/contents/text-models/note-text-type.enum";


export interface TransformContent {
  content: ParentInteractionHTML;
  textType?: NoteTextTypeENUM;
  headingType?: HeadingTypeENUM;
  setFocusToEnd: boolean;
}
