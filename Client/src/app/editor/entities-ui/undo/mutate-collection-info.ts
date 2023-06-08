
import { BaseCollection } from '../../entities/contents/base-collection';
import { BaseFile } from '../../entities/contents/base-file';
import { BaseUndoAction } from './base-undo-action';
import { UndoActionTypeEnum } from './undo-action-type.enum';

export class MutateCollectionInfoAction<T extends BaseCollection<BaseFile>> extends BaseUndoAction {
  constructor(public collection: T, contentId: string) {
    super(UndoActionTypeEnum.mutateCollectionInfo, contentId);
  }
}
