import { ContentModelBase } from 'src/app/editor/entities/contents/content-model-base';
import { BottomNoteContent } from './bottom-note-content.model';
import { FullNote } from './full-note.model';

export class SmallNote extends FullNote {
  contents?: ContentModelBase[];

  order!: number;

  isSelected?: boolean;

  lockRedirect?: boolean;

  isDisplay?: boolean;
  
  additionalInfo?: BottomNoteContent;
}
