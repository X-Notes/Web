import { ElementRef } from '@angular/core';
import { ThemeENUM } from 'src/app/shared/enums/theme.enum';
import { ContentModelBase } from '../../models/editor-models/content-model-base';
import { TextBlock } from '../../models/editor-models/text-models/text-block';
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
  getText(): string;
  mouseEnter($event);
  mouseLeave($event);
  backspaceUp();
  backspaceDown();
  deleteDown();
  detectChanges();
  markForCheck();
  get isActiveState(): boolean;
}
