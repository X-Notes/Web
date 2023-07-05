import { ElementRef } from '@angular/core';
import { ThemeENUM } from 'src/app/shared/enums/theme.enum';
import { SaveSelection } from '../entities-ui/save-selection';
import { NoteTextTypeENUM } from '../entities/contents/text-models/note-text-type.enum';
import { SetFocus } from '../entities-ui/set-focus';
import { BaseText } from '../entities/contents/base-text';
import { ContentModelBase } from '../entities/contents/content-model-base';
import { TextBlock } from '../entities/contents/text-models/text-block';

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
  syncLayoutWithContent();
  getHost(): ElementRef<HTMLElement>;
  addActionsAfterViewInit(actions: (() => void)[]): void;
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
  updateContentsAndSync(contents: TextBlock[], ...actions: (() => void)[]);
  updateWS(): void;
  getEditableNative(): HTMLElement | Element;
  getTextBlocks(): TextBlock[];
  getTextType(): NoteTextTypeENUM;
  getText(): string;
  getSelection(): SaveSelection;
  restoreSelection(pos: SaveSelection): void;
  get isActiveState(): boolean;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ParentInteractionCollection extends ParentInteraction<ContentModelBase> {
  syncCollectionItems();
  updateWS(): void;
}
