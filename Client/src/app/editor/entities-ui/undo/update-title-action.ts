import { BaseUndoAction } from './base-undo-action';
import { UndoActionTypeEnum } from './undo-action-type.enum';

export class UpdateTitleAction extends BaseUndoAction {
  constructor(public title: string) {
    super(UndoActionTypeEnum.mutateTitle, null);
  }
}
