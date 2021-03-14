import { FullNote } from './fullNote';

export interface RequestFullNote {
  canView: boolean;
  caEdit: boolean;
  fullNote: FullNote;
}
