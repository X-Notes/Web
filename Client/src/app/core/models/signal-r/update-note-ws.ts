import { Label } from 'src/app/content/labels/models/label.model';
import { MergeTransaction } from 'src/app/content/notes/full-note/content-editor/text/rga/types';

export interface UpdateNoteWS {
  noteId: string;
  color: string;
  titleTransaction: MergeTransaction<string>;
  isUpdateTitle: boolean;
  removeLabelIds: string[];
  addLabels: Label[];
}
