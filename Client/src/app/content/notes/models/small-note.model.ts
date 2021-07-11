import { BottomNoteContent } from './bottom-note-content.model';
import { ContentModel } from './content-model.model';
import { FullNote } from './full-note.model';

// TODO MAKE CLASS
export interface SmallNote extends FullNote {
  contents: ContentModel[];
  order: number;
  userId: string;
  isSelected?: boolean;
  lockRedirect?: boolean;
  additionalInfo?: BottomNoteContent;
}
