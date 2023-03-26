import { Injectable } from '@angular/core';
import { ContentModelBase } from '../../models/editor-models/content-model-base';
import {
  ComponentType,
  ParentInteraction,
  ParentInteractionHTML,
} from '../models/parent-interaction.interface';
import { ClickableSelectableEntities } from './models/clickable-selectable-entities.enum';

@Injectable()
export class ClickableContentService {
  setTime: Date;

  // prev
  prevContent: ContentModelBase;

  prevItemId: string;

  prevType: ClickableSelectableEntities;

  prevItem: ParentInteraction;

  // current
  currentContent: ContentModelBase;

  currentItemId: string;

  type: ClickableSelectableEntities;

  currentItem: ParentInteraction;

  get isEmptyTextItemFocus(): boolean {
    const isText = this.currentItem.type === ComponentType.HTML;
    if (isText) {
      return (this.currentItem as ParentInteractionHTML).isActiveState;
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
    this.setContent(null, null, this.type, this.currentItem);
  }

  isClicked(itemId: string): boolean {
    return this.currentItemId === itemId;
  }

  setContent(
    content: ContentModelBase,
    itemId: string,
    type: ClickableSelectableEntities,
    currentItem: ParentInteraction,
  ) {
    // PREV
    this.prevContent = this.currentContent;
    this.prevItemId = this.currentItemId;
    this.prevType = this.type;
    this.prevItem = this.currentItem;
    // CURRENT
    this.currentContent = content;
    this.currentItemId = itemId;
    this.type = type;
    this.currentItem = currentItem;
  }

  getTextContentIdOrNull(): string {
    if (this.type === ClickableSelectableEntities.Text) {
      return this.currentContent.id;
    }
    return null;
  }
}
