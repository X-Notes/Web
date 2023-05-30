import { BaseText } from '../../../models/editor-models/base-text';
import { ContentModelBase } from '../../../models/editor-models/content-model-base';
import { ContentTypeENUM } from '../../../models/editor-models/content-types.enum';
import { NewCollection } from '../../models/api/editor/new-collection';
import { NewText } from '../../models/api/editor/new-text';

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

  newTextItems: NewText[] = [];

  photosCollectionItems: NewCollection[] = [];

  audiosCollectionItems: NewCollection[] = [];

  videosCollectionItems: NewCollection[] = [];

  documentsCollectionItems: NewCollection[] = [];

  push(content: ContentModelBase): void {
    switch (content.typeId) {
      case ContentTypeENUM.Text: {
        const text = content as BaseText;
        this.newTextItems.push({
          id: text.id,
          typeId: text.typeId,
          noteTextTypeId: text.noteTextTypeId,
          order: text.order,
          contents: text.contents
        });
        break;
      }
      case ContentTypeENUM.Photos: {
        this.photosCollectionItems.push({
          id: content.id,
          typeId: content.typeId,
          order: content.order
        });
        break;
      }
      case ContentTypeENUM.Documents: {
        this.documentsCollectionItems.push({
          id: content.id,
          typeId: content.typeId,
          order: content.order
        });
        break;
      }
      case ContentTypeENUM.Videos: {
        this.videosCollectionItems.push({
          id: content.id,
          typeId: content.typeId,
          order: content.order
        });
        break;
      }
      case ContentTypeENUM.Audios: {
        this.audiosCollectionItems.push({
          id: content.id,
          typeId: content.typeId,
          order: content.order
        });
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
