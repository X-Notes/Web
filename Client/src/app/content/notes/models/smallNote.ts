import { ContentModel } from './ContentMode';
import { FullNote } from './fullNote';

// TODO MAKE CLASS
export interface SmallNote extends FullNote {
  contents: ContentModel[];
  isSelected?: boolean;
  lockRedirect?: boolean;
}
