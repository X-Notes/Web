import { BreakEnterModel } from '../services/content-editable.service';
import { NoteTextTypeENUM } from '../../models/content-model.model';

export interface EnterEvent {
  id: string;
  breakModel: BreakEnterModel;
  nextItemType: NoteTextTypeENUM;
  contentId: string;
}
