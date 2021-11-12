import { BreakEnterModel } from '../content-editor-services/content-editable.service';
import { NoteTextTypeENUM } from '../../models/content-model.model';

export interface EnterEvent {
  breakModel: BreakEnterModel;
  nextItemType: NoteTextTypeENUM;
  contentId: string;
}
