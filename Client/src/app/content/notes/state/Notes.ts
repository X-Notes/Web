import { NoteTypeENUM } from 'src/app/shared/enums/NoteTypesEnum';
import { SmallNote } from '../models/SmallNote';

export class Notes {
  typeNotes: NoteTypeENUM;

  notes: SmallNote[];

  count: number;

  constructor(typeNotes: NoteTypeENUM, notes: SmallNote[]) {
    this.typeNotes = typeNotes;
    this.notes = notes;
    this.count = notes.length;
  }
}
