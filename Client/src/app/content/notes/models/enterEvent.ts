import { BreakEnterModel } from '../content-editable.service';
import { ContentType } from './ContentMode';

export interface EnterEvent {
    id: string;
    breakModel: BreakEnterModel;
    nextItemType: ContentType;
    contentId: string;
}
