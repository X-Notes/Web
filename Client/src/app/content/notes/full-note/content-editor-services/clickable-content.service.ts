import { Injectable } from '@angular/core';
import { ContentModelBase } from '../../models/editor-models/content-model-base';
import {
  ComponentType,
  ParentInteraction,
  ParentInteractionHTML,
} from '../models/parent-interaction.interface';
import { ClickableSelectableEntities } from './models/clickable-selectable-entities.enum';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { updateCursorDelay } from 'src/app/core/defaults/bounceDelay';
import { DestroyComponentService } from 'src/app/shared/services/destroy-component.service';
import { ApiBrowserTextService } from '../../api-browser-text.service';

@Injectable()
export class ClickableContentService {
  setTime: Date;

  // prev
  prevContent: ContentModelBase;

  prevItemId: string;

  prevType: ClickableSelectableEntities;

  prevItem: ParentInteraction<ContentModelBase>;

  // current
  currentContent: ContentModelBase;

  currentItemId: string;

  type: ClickableSelectableEntities;

  currentItem: ParentInteraction<ContentModelBase>;

  cursorChanged$: Subject<() => void> = new Subject();

  constructor(public dc: DestroyComponentService, private apiBrowser: ApiBrowserTextService) {
    this.cursorChanged$
      .pipe(takeUntil(dc.d$), debounceTime(updateCursorDelay))
      .subscribe((action) => {
        action();
      });
  }

  get isEmptyTextItemFocus(): boolean {
    if (!this.currentItem) return false;
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
    currentItem: ParentInteraction<ContentModelBase>,
  ) {
    if (type !== ClickableSelectableEntities.Text) {
      this.apiBrowser.removeAllRanges();
    }
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
