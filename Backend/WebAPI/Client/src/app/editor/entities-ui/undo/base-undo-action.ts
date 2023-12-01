import { UndoActionTypeEnum } from './undo-action-type.enum';

export class BaseUndoAction {
  constructor(public type: UndoActionTypeEnum, public contentId: string) {}
}
