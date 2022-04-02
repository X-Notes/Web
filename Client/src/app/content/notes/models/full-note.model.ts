import { NoteTypeENUM } from 'src/app/shared/enums/note-types.enum';
import { RefTypeENUM } from 'src/app/shared/enums/ref-type.enum';
import { Label } from '../../labels/models/label.model';

export interface FullNote {
  id: string;
  title: string;
  color: string;
  labels: Label[];
  refTypeId: RefTypeENUM;
  noteTypeId: NoteTypeENUM;
  isLocked: boolean;
  isLockedNow: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}
