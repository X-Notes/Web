import { NoteTypeENUM } from 'src/app/shared/enums/note-types.enum';
import { SmallNote } from '../models/small-note.model';

export class Notes {
  typeNotes: NoteTypeENUM;

  notes: SmallNote[];

  count: number;

  constructor(typeNotes: NoteTypeENUM, notes: SmallNote[]) {
    this.typeNotes = typeNotes;
    this.validate(notes);
    this.notes = notes;
    this.count = notes.length;
  }

  validate(notes: SmallNote[]): void {
    notes.forEach((note) => {
      if (!note.title.isContainsMethods) {
        throw new Error('Title invalid');
      }
    });
  }
}
