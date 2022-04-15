import { Label } from '../../labels/models/label.model';

export class UpdateNoteUI {
  id: string;

  color: string;

  title: string;

  removeLabelIds: string[];

  addLabels: Label[];

  allLabels: Label[];

  isLocked?: boolean;

  isLockedNow?: boolean;

  unlockedTime: Date;

  constructor(id: string) {
    this.id = id;
  }
}
