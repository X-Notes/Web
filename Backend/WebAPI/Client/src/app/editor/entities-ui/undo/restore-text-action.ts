import { BaseText } from '../../entities/contents/base-text';
import { BaseUndoAction } from './base-undo-action';
import { UndoActionTypeEnum } from './undo-action-type.enum';

export class RestoreTextAction extends BaseUndoAction {
  constructor(public text: BaseText, public order: number) {
    super(UndoActionTypeEnum.restoreText, null);
  }
}
