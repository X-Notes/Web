import { NoteType } from 'src/app/shared/enums/NoteTypes';
import { SmallNote } from '../models/smallNote';

export class Notes {
    typeNotes: NoteType;
    notes: SmallNote[];
    count: number;
    constructor(typeNotes: NoteType, notes: SmallNote[]) {
        this.typeNotes = typeNotes;
        this.notes = notes;
        this.count = notes.length;
    }
}
