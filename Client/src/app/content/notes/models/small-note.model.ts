import { ContentModel } from './content-model.model';
import { FullNote } from './full-note.model';

// TODO MAKE CLASS
export interface SmallNote extends FullNote {
  contents: ContentModel[];
  order: number;
  isSelected?: boolean;
  lockRedirect?: boolean;
}
