import { Label } from '../../labels/models/label.model';

export class UpdateNoteUI {
  id: string;

  color: string;

  title: string;

  removeLabelIds: string[];

  addLabels: Label[];

  allLabels: Label[];
}
