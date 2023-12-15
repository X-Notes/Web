
export class UpdateNoteUI {
  id: string;

  color?: string;

  title?: string;

  removeLabelIds?: string[];

  isCanEdit?: boolean;

  addLabels?: string[];

  allLabels?: string[];

  isLocked?: boolean;

  isLockedNow?: boolean;

  unlockedTime?: Date;

  constructor(id: string) {
    this.id = id;
  }
}
