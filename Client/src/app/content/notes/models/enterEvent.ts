import { BreakEnterModel } from '../content-editable.service';
import { ContentType } from './ContentModel';

export interface EnterEvent {
  id: string;
  breakModel: BreakEnterModel;
  nextItemType: ContentType;
  contentId: string;
}
