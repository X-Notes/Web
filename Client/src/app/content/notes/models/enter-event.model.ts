import { BreakEnterModel } from '../content-editable.service';
import { NoteTextTypeENUM } from './content-model.model';

export interface EnterEvent {
  id: string;
  breakModel: BreakEnterModel;
  nextItemType: NoteTextTypeENUM;
  contentId: string;
}
