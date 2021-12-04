import { BaseText, ContentModel, ContentTypeENUM } from '../../../models/content-model.model';

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

  private newTextItems: BaseText[] = [];

  private photosCollectionItems: ContentModel[] = [];

  private audiosCollectionItems: ContentModel[] = [];

  private videosCollectionItems: ContentModel[] = [];

  private documentsCollectionItems: ContentModel[] = [];

  get textItems(): BaseText[] {
    return this.newTextItems;
  }

  push(content: ContentModel): void {
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
