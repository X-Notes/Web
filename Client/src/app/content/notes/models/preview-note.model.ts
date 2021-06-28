import { SmallNote } from './small-note.model';

export interface PreviewNote extends SmallNote {
  isSelected: boolean;
}
