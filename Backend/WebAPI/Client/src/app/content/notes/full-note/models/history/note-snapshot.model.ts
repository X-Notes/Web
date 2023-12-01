import { Label } from 'src/app/content/labels/models/label.model';
import { NoteTypeENUM } from 'src/app/shared/enums/note-types.enum';
import { RefTypeENUM } from 'src/app/shared/enums/ref-type.enum';

export interface NoteSnapshot {
  id: string;
  title: string;
  color: string;
  labels: Label[];
  refTypeId: RefTypeENUM;
  noteTypeId: NoteTypeENUM;
  snapshotTime: Date;
  noteId: string;
}
