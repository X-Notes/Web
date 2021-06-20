import { BreakEnterModel } from '../content-editable.service';
import { NoteTextTypeENUM } from './ContentModel';

export interface EnterEvent {
  id: string;
  breakModel: BreakEnterModel;
  nextItemType: NoteTextTypeENUM;
  contentId: string;
}
