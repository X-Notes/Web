import { FullNote } from './full-note.model';

export interface RequestFullNote {
  isOwner: boolean;
  canView: boolean;
  caEdit: boolean;
  fullNote: FullNote;
  authorId: string;
}
