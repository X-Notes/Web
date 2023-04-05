import { BaseCollection } from 'src/app/content/notes/models/editor-models/base-collection';
import { BaseFile } from 'src/app/content/notes/models/editor-models/base-file';
import { BaseUndoAction } from './base-undo-action';
import { UndoActionTypeEnum } from './undo-action-type.enum';

export class MutateCollectionInfoAction<T extends BaseCollection<BaseFile>> extends BaseUndoAction {
  constructor(public collection: T, contentId: string) {
    super(UndoActionTypeEnum.mutateCollectionInfo, contentId);
  }
}
