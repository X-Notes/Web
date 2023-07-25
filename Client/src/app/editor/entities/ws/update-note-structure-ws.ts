import { BaseText } from 'src/app/editor/entities/contents/base-text';
import { UpdateContentPosition } from './update-content-position-ws';
import { ContentModelBase } from '../contents/content-model-base';

export class UpdateEditorStructureWS {
  contentIdsToDelete?: string[];

  textContentsToAdd?: BaseText[];

  collectionContentsToAdd?: ContentModelBase[];

  positions?: UpdateContentPosition[];

  constructor(data: Partial<UpdateEditorStructureWS>) {
    this.contentIdsToDelete = data.contentIdsToDelete;
    this.collectionContentsToAdd = data.collectionContentsToAdd;
    this.positions = data.positions;
    this.mapTexts(data);
  }

  private mapTexts(data: Partial<UpdateEditorStructureWS>) {
    if (data.textContentsToAdd && data.textContentsToAdd.length > 0) {
      this.textContentsToAdd = data.textContentsToAdd.map((q) => new BaseText(q));
    }
  }
}
