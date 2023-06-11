import { SmallNote } from "../../models/small-note.model";

export interface SelectNoteEvent {
    isSelected: boolean;
    note: SmallNote;
}