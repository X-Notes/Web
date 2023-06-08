import { BaseUndoAction } from './base-undo-action';
import { UndoActionTypeEnum } from './undo-action-type.enum';

export class RemoveCollectionItemsAction extends BaseUndoAction {
  constructor(public ids: string[], contentId: string) {
    super(UndoActionTypeEnum.removeCollectionItems, contentId);
  }
}
