import { ElementRef } from '@angular/core';
import { ContentModel } from '../../models/content-model.model';

export interface ParentInteraction {
  isReadOnlyMode: boolean;
  setFocus($event?);
  setFocusToEnd();
  updateHTML(content: string);
  getEditableNative();
  getHost(): ElementRef<HTMLElement>;
  getContent(): ContentModel;
  mouseEnter($event);
  mouseOut($event);
  backspaceUp();
  backspaceDown();
  deleteDown();
}
