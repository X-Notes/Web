import { Label } from "../../labels/models/label.model";

export interface SyncNoteResult {
    noteId: string;
    title: string;
    color: string;
    version: number;
    labels?: Label[];
}