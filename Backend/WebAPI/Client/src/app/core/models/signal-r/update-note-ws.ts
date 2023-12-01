import { Label } from 'src/app/content/labels/models/label.model';

export interface UpdateNoteWS {
  noteId: string;
  color: string;
  title: string;
  isUpdateTitle: boolean;
  removeLabelIds: string[];
  addLabels: Label[];
}
