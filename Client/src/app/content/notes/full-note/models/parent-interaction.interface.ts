import { ElementRef } from '@angular/core';
import { ThemeENUM } from 'src/app/shared/enums/theme.enum';
import { ContentModel } from '../../models/content-model.model';
import { SetFocus } from './set-focus';

export interface ParentInteraction {
  isReadOnlyMode: boolean;
  isSelected: boolean;
  theme: ThemeENUM;
  isFocusToNext(entity?: SetFocus): boolean;
  setFocus(entity?: SetFocus);
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
  detectChanges();
  markForCheck();
}
