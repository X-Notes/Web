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

  setTime: Date;

  set(type: ClickableSelectableEntities, id: string, collectionId: string) {
    this.type = type;
    this.id = id;
    this.collectionId = collectionId;
    this.setTime = new Date();
  }

  timeDifference(): number {
    if(this.setTime) {
    const start = this.setTime.getTime();
    const end = new Date().getTime();
    const diff = end - start;
    return diff / 1000;
    }
    return Infinity;
  }

  reset() {
    if(this.timeDifference() < 0.03){
      return;
    }
    this.resetIternal();
  }

  resetHard() {
    this.resetIternal();
  }

  private resetIternal(){
    this.type = null;
    this.id = null;
    this.collectionId = null;
  }
}
