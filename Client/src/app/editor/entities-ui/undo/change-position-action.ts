
import { UpdateContentPosition } from '../../entities/ws/update-content-position-ws';
import { BaseUndoAction } from './base-undo-action';
import { UndoActionTypeEnum } from './undo-action-type.enum';

export class ChangePositionAction extends BaseUndoAction {
  constructor(public positions: UpdateContentPosition[]) {
    super(UndoActionTypeEnum.reorder, null);
  }
}
