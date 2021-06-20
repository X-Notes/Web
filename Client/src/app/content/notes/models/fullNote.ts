import { NoteTypeENUM } from 'src/app/shared/enums/NoteTypesEnum';
import { RefTypeENUM } from 'src/app/shared/enums/refTypeEnum';
import { Label } from '../../labels/models/label';

export interface FullNote {
  id: string;
  title: string;
  color: string;
  labels: Label[];
  refTypeId: RefTypeENUM;
  noteTypeId: NoteTypeENUM;
  isLocked: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}
