import { BaseText } from 'src/app/content/notes/models/editor-models/base-text';
import { BaseUndoAction } from './base-undo-action';
import { UndoActionTypeEnum } from './undo-action-type.enum';

export class RestoreTextAction extends BaseUndoAction {
  constructor(public text: BaseText, public order: number) {
    super(UndoActionTypeEnum.restoreText, null);
  }
}
