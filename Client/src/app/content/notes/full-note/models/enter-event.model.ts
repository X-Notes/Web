import { BreakEnterModel } from '../content-editor-services/models/break-enter.model';
import { NoteTextTypeENUM } from '../content-editor/text/note-text-type.enum';

export interface EnterEvent {
  breakModel: BreakEnterModel;
  nextItemType: NoteTextTypeENUM;
  contentId: string;
}
