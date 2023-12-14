import { NoteTypeENUM } from 'src/app/shared/enums/note-types.enum';
import { SmallNote } from '../models/small-note.model';

export class Notes {
  typeNotes: NoteTypeENUM;

  notes: SmallNote[];

  constructor(typeNotes: NoteTypeENUM, notes: SmallNote[]) {
    this.typeNotes = typeNotes;
    this.notes = notes;
  }
}
