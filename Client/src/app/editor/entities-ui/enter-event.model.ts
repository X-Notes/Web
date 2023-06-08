import { NoteTextTypeENUM } from "../entities/contents/text-models/note-text-type.enum";
import { BreakEnterModel } from "./break-enter.model";


export interface EnterEvent {
  breakModel: BreakEnterModel;
  nextItemType: NoteTextTypeENUM;
  contentId: string;
}
