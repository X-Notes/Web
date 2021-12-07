import { BottomNoteContent } from './bottom-note-content.model';
import { ContentModelBase } from './editor-models/content-model-base';
import { FullNote } from './full-note.model';

// TODO MAKE CLASS
export interface SmallNote extends FullNote {
  contents: ContentModelBase[];
  order: number;
  userId: string;
  isSelected?: boolean;
  lockRedirect?: boolean;
  additionalInfo?: BottomNoteContent;
}
