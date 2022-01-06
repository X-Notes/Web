import { Label } from 'src/app/content/labels/models/label.model';

export interface UpdateNoteWS {
  noteId: string;
  color: string;
  title: string;
  labels: Label[];
}
