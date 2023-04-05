import { BaseCollection } from 'src/app/content/notes/models/editor-models/base-collection';
import { BaseFile } from 'src/app/content/notes/models/editor-models/base-file';
import { BaseUndoAction } from './base-undo-action';
import { UndoActionTypeEnum } from './undo-action-type.enum';

export class RestoreCollectionAction extends BaseUndoAction {
  constructor(public collection: BaseCollection<BaseFile>, public order: number) {
    super(UndoActionTypeEnum.restoreCollection, null);
  }
}
