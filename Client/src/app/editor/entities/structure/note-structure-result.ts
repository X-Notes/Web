
import { UpdateNoteStructureWS } from '../ws/update-note-structure-ws';
import { NoteUpdateIds } from './note-update-ids';

export interface NoteStructureResult {
  updates: UpdateNoteStructureWS;
  updateIds: NoteUpdateIds[];
}
