import { ElementRef } from '@angular/core';
import { ThemeENUM } from 'src/app/shared/enums/theme.enum';
import { TextBlock } from '../../models/editor-models/base-text';
import { ContentModelBase } from '../../models/editor-models/content-model-base';
import { SetFocus } from './set-focus';

export interface ParentInteraction {
  isReadOnlyMode: boolean;
  isSelected: boolean;
  theme: ThemeENUM;
  isFocusToNext(entity?: SetFocus): boolean;
  setFocus(entity?: SetFocus);
  setFocusToEnd();
  updateHTML(contents: TextBlock[]);
  syncContentWithLayout();
  syncContentItems();
  syncHtmlWithLayout();
  getEditableNative(): HTMLElement | Element;
  getHost(): ElementRef<HTMLElement>;
  getTextBlocks(): TextBlock[];
  getContent(): ContentModelBase;
  getContentId(): string;
  mouseEnter($event);
  mouseLeave($event);
  backspaceUp();
  backspaceDown();
  deleteDown();
  detectChanges();
  markForCheck();
}
