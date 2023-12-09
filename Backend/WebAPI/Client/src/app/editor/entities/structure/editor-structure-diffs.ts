import { NewCollection } from '../collections/new-collection';
import { BaseText } from '../contents/base-text';
import { ContentModelBase } from '../contents/content-model-base';
import { ContentTypeENUM } from '../contents/content-types.enum';
import { NewText } from '../text/new-text';

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

export class EditorStructureDiffs {
  positions: PositionDiff[] = [];

  removedItems: ItemForRemove[] = [];

  newTextItems: NewText[] = [];

  collectionItems: NewCollection[] = [];

  push(content: ContentModelBase): void {
    if (content.typeId === ContentTypeENUM.Text) {
      const text = content as BaseText;
      this.newTextItems.push({
        id: text.id,
        noteTextTypeId: text.metadata?.noteTextTypeId,
        order: text.order,
        contents: text.contents
      });
      return;
    }
    const collectionTypes = [ContentTypeENUM.Photos, ContentTypeENUM.Documents, ContentTypeENUM.Videos, ContentTypeENUM.Audios];
    if (collectionTypes.some(id => id === content.typeId)) {
      this.collectionItems.push({
        id: content.id,
        typeId: content.typeId,
        order: content.order
      });
      return;
    }
    throw new Error('Incorrect type');
  }

  isAnyChanges() {
    return (
      this.positions.length > 0 ||
      this.newTextItems.length > 0 ||
      this.removedItems.length > 0 ||
      this.collectionItems.length > 0
    );
  }
}
