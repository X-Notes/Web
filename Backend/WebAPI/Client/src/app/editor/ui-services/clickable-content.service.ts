import { Injectable } from '@angular/core';
import {
  ParentInteraction,
} from '../components/parent-interaction.interface';
import { ClickableSelectableEntities } from '../entities-ui/clickable-selectable-entities.enum';
import { Subject } from 'rxjs';
import { debounceTime, filter, takeUntil } from 'rxjs/operators';
import { updateCursorDelay } from 'src/app/core/defaults/bounceDelay';
import { DestroyComponentService } from 'src/app/shared/services/destroy-component.service';
import { ContentModelBase } from '../entities/contents/content-model-base';
import { SelectionService } from './selection.service';

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

  cursorUpdatingActive = true;

  constructor(public dc: DestroyComponentService, private selectionService: SelectionService) {
    this.cursorChanged$
      .pipe(takeUntil(dc.d$), filter(() => this.cursorUpdatingActive), debounceTime(updateCursorDelay))
      .subscribe((action) => {
        try {
          action();
        } catch (e) {
          console.error(e);
        }
      });
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
    keepRanges = false
  ) {
    if (type !== ClickableSelectableEntities.Text && !keepRanges) {
      this.selectionService.resetSelectionAndItems();
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
