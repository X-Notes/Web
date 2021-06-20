import { ContentModel } from './ContentModel';
import { FullNote } from './FullNote';

// TODO MAKE CLASS
export interface SmallNote extends FullNote {
  contents: ContentModel[];
  isSelected?: boolean;
  lockRedirect?: boolean;
}
