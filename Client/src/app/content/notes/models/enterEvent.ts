import { LineBreakType } from '../html-models';
import { HtmlType } from './ContentMode';

export interface EnterEvent {
    id: string;
    typeBreak: LineBreakType;
    html?: DocumentFragment;
    itemType: HtmlType;
}
