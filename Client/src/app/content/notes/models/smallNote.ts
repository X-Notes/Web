import { EntityRef } from 'src/app/shared/models/entityRef';
import { NoteType } from 'src/app/shared/models/noteType';
import { Label } from '../../labels/models/label';
import { ContentModel } from './ContentMode';

export interface SmallNote {
  id: string;
  title: string;
  color: string;
  labels: Label[];
  refType: EntityRef;
  noteType: NoteType;
  contents: ContentModel[];
  isSelected?: boolean;
  lockRedirect?: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}
