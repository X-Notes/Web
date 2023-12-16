import { ContentModelBase } from 'src/app/editor/entities/contents/content-model-base';
import { BottomNoteContent } from './bottom-note-content.model';
import { BaseNote } from './base-note.model';

export class SmallNote extends BaseNote {
  contents?: ContentModelBase[];

  order!: number;

  // UI FIELDS
  isSelected?: boolean;

  lockRedirect?: boolean;

  isDisplay?: boolean;

  isBottomSectionLoading?: boolean;
  
  additionalInfo?: BottomNoteContent;
}
