import { NoteTypeENUM } from 'src/app/shared/enums/note-types.enum';
import { RefTypeENUM } from 'src/app/shared/enums/ref-type.enum';
import { Label } from '../../labels/models/label.model';

export class FullNote {
  id: string;

  title: string;

  color: string;

  labels: Label[];

  userId: string;

  isCanEdit: boolean;

  refTypeId: RefTypeENUM;

  noteTypeId: NoteTypeENUM;

  isLocked: boolean;

  isLockedNow: boolean;

  unlockedTime?: Date;

  createdAt: Date;

  updatedAt: Date;

  deletedAt: Date;
}
