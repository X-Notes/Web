import { ElementRef } from '@angular/core';
import { ThemeENUM } from 'src/app/shared/enums/theme.enum';
import { BaseText } from '../../models/editor-models/base-text';
import { ContentModelBase } from '../../models/editor-models/content-model-base';
import { TextBlock } from '../../models/editor-models/text-models/text-block';
import { SetFocus } from './set-focus';
import { SaveSelection } from '../../models/browser/save-selection';

export enum ComponentType {
  HTML = 1,
  Collection,
}

export interface ParentInteraction<T> {
  type: ComponentType;
  isReadOnlyMode: boolean;
  isSelected: boolean;
  theme: ThemeENUM;
  isFocusToNext(entity?: SetFocus): boolean;
  setFocus(entity?: SetFocus);
  setFocusToEnd();
  syncLayoutWithContent(emitChanges: boolean);
  getHost(): ElementRef<HTMLElement>;
  getContent(): T;
  getContentId(): string;
  mouseEnter($event);
  mouseLeave($event);
  backspaceUp();
  backspaceDown();
  deleteDown();
  detectChanges();
  markForCheck();
}

export interface ParentInteractionHTML extends ParentInteraction<BaseText> {
  syncHtmlWithLayout();
  updateHTML(contents: TextBlock[], emitChanges: boolean);
  updateWS(): void;
  getEditableNative(): HTMLElement | Element;
  getTextBlocks(): TextBlock[];
  getText(): string;
  getSelection(): SaveSelection;
  restoreSelection(pos: SaveSelection): void;
  get isActiveState(): boolean;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ParentInteractionCollection extends ParentInteraction<ContentModelBase> {
  syncCollectionItems();
}
