import { BaseText } from '../../../models/editor-models/base-text';
import { ContentModelBase } from '../../../models/editor-models/content-model-base';
import { ContentTypeENUM } from '../../../models/editor-models/content-types.enum';

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
