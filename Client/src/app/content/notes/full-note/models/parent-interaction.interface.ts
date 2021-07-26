import { ContentModel } from '../../models/content-model.model';

export interface ParentInteraction {
  setFocus($event?);
  setFocusToEnd();
  updateHTML(content: string);
  getNative();
  getContent(): ContentModel;
  mouseEnter($event);
  mouseOut($event);
  isReadOnlyMode: boolean;
}
