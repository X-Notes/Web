import { NoteTextTypeENUM } from '../../models/editor-models/base-text';
import { BreakEnterModel } from '../content-editor-services/content-editable.service';

export interface EnterEvent {
  breakModel: BreakEnterModel;
  nextItemType: NoteTextTypeENUM;
  contentId: string;
}
