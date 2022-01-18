import { FullNote } from './full-note.model';

export interface RequestFullNote {
  isOwner: boolean;
  canView: boolean;
  canEdit: boolean;
  fullNote: FullNote;
  authorId: string;
}
