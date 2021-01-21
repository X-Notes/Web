import { LineBreakType } from '../html-models';
import { ContentType } from './ContentMode';

export interface EnterEvent {
    id: string;
    typeBreak: LineBreakType;
    html?: DocumentFragment;
    itemType: ContentType;
}
