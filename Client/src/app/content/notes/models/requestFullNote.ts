import { FullNote } from './FullNote';

export interface RequestFullNote {
  isOwner: boolean;
  canView: boolean;
  caEdit: boolean;
  fullNote: FullNote;
}
