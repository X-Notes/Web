import { ElementRef } from '@angular/core';
import { ThemeENUM } from 'src/app/shared/enums/theme.enum';
import { ContentModelBase } from '../../models/editor-models/content-model-base';
import { ProjectBlock } from '../content-editor/text/entities/blocks/projection-block';
import { SetFocus } from './set-focus';

export interface ParentInteraction {
  isReadOnlyMode: boolean;
  isSelected: boolean;
  theme: ThemeENUM;
  isFocusToNext(entity?: SetFocus): boolean;
  setFocus(entity?: SetFocus);
  setFocusToEnd();
  updateHTML(contents: ProjectBlock[]);
  syncContentWithLayout();
  syncContentItems();
  syncHtmlWithLayout();
  getEditableNative(): HTMLElement | Element;
  getHost(): ElementRef<HTMLElement>;
  getTextBlocks(): ProjectBlock[];
  getContent(): ContentModelBase;
  getContentId(): string;
  mouseEnter($event);
  mouseLeave($event);
  backspaceUp();
  backspaceDown();
  deleteDown();
  detectChanges();
  markForCheck();
  get isActiveState(): boolean;
}
