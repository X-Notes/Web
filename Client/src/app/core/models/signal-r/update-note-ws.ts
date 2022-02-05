import { Label } from 'src/app/content/labels/models/label.model';

export interface UpdateNoteWS {
  noteId: string;
  color: string;
  title: string;
  removeLabelIds: string[];
  addLabels: Label[];
}
