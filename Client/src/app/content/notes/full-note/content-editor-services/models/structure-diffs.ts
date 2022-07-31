import { BaseText } from '../../../models/editor-models/base-text';
import { ContentModelBase } from '../../../models/editor-models/content-model-base';
import { ContentTypeENUM } from '../../../models/editor-models/content-types.enum';
import { NoteUpdateIds } from '../../models/api/notes/note-update-ids';

export class PositionDiff {
  id: string;

  order: number;

  constructor(index: number, id: string) {
    this.order = index;
    this.id = id;
  }
}

export class ItemForRemove {
  id: string;

  constructor(id: string) {
    this.id = id;
  }
}

export class StructureDiffs {
  positions: PositionDiff[] = [];

  removedItems: ItemForRemove[] = [];

  newTextItems: BaseText[] = [];

  photosCollectionItems: ContentModelBase[] = [];

  audiosCollectionItems: ContentModelBase[] = [];

  videosCollectionItems: ContentModelBase[] = [];

  documentsCollectionItems: ContentModelBase[] = [];

  updateIdForAll(updateIds: NoteUpdateIds[]): void {
    for (const update of updateIds) {
      this.updateId(update.prevId, update.id, this.newTextItems);
      this.updateId(update.prevId, update.id, this.photosCollectionItems);
      this.updateId(update.prevId, update.id, this.audiosCollectionItems);
      this.updateId(update.prevId, update.id, this.videosCollectionItems);
      this.updateId(update.prevId, update.id, this.documentsCollectionItems);
    }
  }

  updateId(prevId: string, newId: string, items: ContentModelBase[]): void {
    for (const item of items) {
      if (item.id === prevId) {
        item.id = newId;
      }
    }
  }

  push(content: ContentModelBase): void {
    switch (content.typeId) {
      case ContentTypeENUM.Text: {
        this.newTextItems.push(content as BaseText);
        break;
      }
      case ContentTypeENUM.Photos: {
        this.photosCollectionItems.push(content);
        break;
      }
      case ContentTypeENUM.Documents: {
        this.documentsCollectionItems.push(content);
        break;
      }
      case ContentTypeENUM.Videos: {
        this.videosCollectionItems.push(content);
        break;
      }
      case ContentTypeENUM.Audios: {
        this.audiosCollectionItems.push(content);
        break;
      }
      default: {
        throw new Error('Incorrect type');
      }
    }
  }

  isAnyChanges() {
    return (
      this.positions.length > 0 ||
      this.newTextItems.length > 0 ||
      this.removedItems.length > 0 ||
      this.photosCollectionItems.length > 0 ||
      this.audiosCollectionItems.length > 0 ||
      this.videosCollectionItems.length > 0 ||
      this.documentsCollectionItems.length > 0
    );
  }
}
