import { SmallNote } from './small-note.model';

export interface RelatedNote extends SmallNote {
  reletionId: number;
  isOpened: boolean;
}
