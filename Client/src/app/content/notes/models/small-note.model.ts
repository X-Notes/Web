import { BottomNoteContent } from './bottom-note-content.model';
import { ContentModelBase } from './editor-models/content-model-base';
import { FullNote } from './full-note.model';

export class SmallNote extends FullNote {
  contents: ContentModelBase[];

  order: number;

  userId: string;

  isCanEdit: boolean;

  isSelected?: boolean;

  lockRedirect?: boolean;

  additionalInfo?: BottomNoteContent;
}
