import { Injectable } from '@angular/core';
import { ContentModelBase } from '../../models/editor-models/content-model-base';
import { NoteTextTypeENUM } from '../../models/editor-models/text-models/note-text-type.enum';
import { BaseTextElementComponent } from '../full-note-components/html-components/html-base.component';
import { ClickableSelectableEntities } from './models/clickable-selectable-entities.enum';

@Injectable()
export class ClickableContentService {
  setTime: Date;

  currentContent: ContentModelBase;

  currentItemId: string;

  type: ClickableSelectableEntities;

  currentTextItem: BaseTextElementComponent;

  get isEmptyTextItemFocus() {
    if (this.currentTextItem?.content?.noteTextTypeId === NoteTextTypeENUM.default) {
      return this.currentTextItem.isActiveState;
    }
    return false;
  }

  get isPhoto(): boolean {
    return this.type === ClickableSelectableEntities.Photo && !!this.currentItemId;
  }

  isEqual(content: ContentModelBase): boolean {
    return content.id === this.currentContent?.id;
  }

  reset() {
    this.setContent(null, null, this.type, this.currentTextItem);
  }

  isClicked(itemId: string): boolean {
    return this.currentItemId === itemId;
  }

  setContent(
    content: ContentModelBase,
    itemId: string,
    type: ClickableSelectableEntities,
    currentTextItem: BaseTextElementComponent,
  ) {
    this.currentContent = content;
    this.currentItemId = itemId;
    this.type = type;
    this.currentTextItem = currentTextItem;
  }

  getTextContentIdOrNull(): string {
    if (this.type === ClickableSelectableEntities.Text) {
      return this.currentContent.id;
    }
    return null;
  }
}
