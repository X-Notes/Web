import { Injectable } from '@angular/core';

export enum ClickableSelectableEntities {
  Photo,
  Video,
  Audio,
  Document,
}

@Injectable()
export class ClickableContentService {
  type: ClickableSelectableEntities;

  id: string;

  collectionId: string;

  set(type: ClickableSelectableEntities, id: string, collectionId: string) {
    this.type = type;
    this.id = id;
    this.collectionId = collectionId;
  }

  reset() {
    this.type = null;
    this.id = null;
    this.collectionId = null;
  }
}
