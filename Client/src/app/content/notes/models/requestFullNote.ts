import { FullNote } from './fullNote';

export interface RequestFullNote {
  isOwner: boolean;
  canView: boolean;
  caEdit: boolean;
  fullNote: FullNote;
}
