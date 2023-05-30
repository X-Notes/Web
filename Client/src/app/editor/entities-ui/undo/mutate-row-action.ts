import { TextBlock } from '../../entities/contents/text-models/text-block';
import { BaseUndoAction } from './base-undo-action';
import { UndoActionTypeEnum } from './undo-action-type.enum';

export class MutateRowAction extends BaseUndoAction {
  constructor(public textBlocks: TextBlock[], contentId: string) {
    super(UndoActionTypeEnum.textMutate, contentId);
  }
}
