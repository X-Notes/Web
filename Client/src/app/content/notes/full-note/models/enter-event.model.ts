import { NoteTextTypeENUM } from '../../models/editor-models/base-text';
import { BreakEnterModel } from '../content-editor-services/break-enter.model';

export interface EnterEvent {
  breakModel: BreakEnterModel;
  nextItemType: NoteTextTypeENUM;
  contentId: string;
}
