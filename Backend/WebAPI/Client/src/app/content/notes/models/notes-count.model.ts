import { NoteTypeENUM } from "src/app/shared/enums/note-types.enum";

export interface NotesCount {
    noteTypeId: NoteTypeENUM;
    count: number;
}