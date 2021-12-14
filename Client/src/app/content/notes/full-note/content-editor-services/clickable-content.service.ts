import { Injectable } from '@angular/core';
import { ContentModelBase } from '../../models/editor-models/content-model-base';
import { ClickableSelectableEntities } from './clickable-selectable-entities.enum';

@Injectable()
export class ClickableContentService {
  setTime: Date;

  currentContentId: string;

  currentItemId: string;

  type: ClickableSelectableEntities;

  set(type: ClickableSelectableEntities, id: string, collectionId: string) {
    this.setSontent(collectionId, id, type);
    this.setTime = new Date();
  }

  isEqual(content: ContentModelBase): boolean {
    return content.id === this.currentContentId;
  }

  reset() {
    this.setSontent(null, null, null);
  }


  isClicked(itemId: string): boolean {
    return this.currentItemId === itemId;
  }

  setSontent(contentId: string, itemId: string, type: ClickableSelectableEntities) {
    this.currentContentId = contentId;
    this.currentItemId = itemId;
    this.type = type;
  }
}
