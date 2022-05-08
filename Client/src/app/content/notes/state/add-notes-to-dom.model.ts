import { NoteTypeENUM } from 'src/app/shared/enums/note-types.enum';
import { SmallNote } from '../models/small-note.model';

export interface AddNotesToDom {
  notes: SmallNote[];

  type?: NoteTypeENUM;
}
