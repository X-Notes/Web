import { Label } from '../../labels/models/label.model';
import { TreeRGA } from '../full-note/content-editor/text/rga/tree-rga';

export class UpdateNoteUI {
  id: string;

  color: string;

  removeLabelIds: string[];

  isCanEdit: boolean;

  addLabels: Label[];

  allLabels: Label[];

  isLocked?: boolean;

  isLockedNow?: boolean;

  unlockedTime: Date;

  constructor(id: string) {
    this.id = id;
  }
}
