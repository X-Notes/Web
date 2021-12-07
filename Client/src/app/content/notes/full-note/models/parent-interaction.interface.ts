import { ElementRef } from '@angular/core';
import { ThemeENUM } from 'src/app/shared/enums/theme.enum';
import { ContentModelBase } from '../../models/editor-models/content-model-base';
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
  getContent(): ContentModelBase;
  mouseEnter($event);
  mouseLeave($event);
  backspaceUp();
  backspaceDown();
  deleteDown();
  detectChanges();
  markForCheck();
}
