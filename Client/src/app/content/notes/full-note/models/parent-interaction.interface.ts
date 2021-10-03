import { ContentModel } from '../../models/content-model.model';

export interface ParentInteraction {
  isReadOnlyMode: boolean;
  setFocus($event?);
  setFocusToEnd();
  updateHTML(content: string);
  getNative();
  getContent(): ContentModel;
  mouseEnter($event);
  mouseOut($event);
  backspaceUp();
  backspaceDown();
  deleteDown();
}
