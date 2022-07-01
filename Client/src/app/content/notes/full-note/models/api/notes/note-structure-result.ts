import { NoteUpdateIds } from "./note-update-ids";

export interface NoteStructureResult {
  removedIds: string[];
  updateIds: NoteUpdateIds[];
}
