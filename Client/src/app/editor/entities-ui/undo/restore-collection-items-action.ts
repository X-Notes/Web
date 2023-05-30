
import { BaseFile } from '../../entities/contents/base-file';
import { BaseUndoAction } from './base-undo-action';
import { UndoActionTypeEnum } from './undo-action-type.enum';

export class RestoreCollectionItemsAction extends BaseUndoAction {
  constructor(public items: BaseFile[], contentId: string) {
    super(UndoActionTypeEnum.restoreCollectionItems, contentId);
  }
}
