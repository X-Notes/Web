import { NoteTextTypeENUM } from '../../models/editor-models/text-models/note-text-type.enum';
import { BreakEnterModel } from '../content-editor-services/models/break-enter.model';

export interface EnterEvent {
  breakModel: BreakEnterModel;
  nextItemType: NoteTextTypeENUM;
  contentId: string;
}
