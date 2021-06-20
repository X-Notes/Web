import { ContentModel } from './ContentModel';

export interface ParentInteraction {
  setFocus($event?);
  setFocusToEnd();
  updateHTML(content: string);
  getNative();
  getContent(): ContentModel;
  mouseEnter($event);
  mouseOut($event);
}
