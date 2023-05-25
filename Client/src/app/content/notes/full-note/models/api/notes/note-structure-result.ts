import { UpdateNoteStructureWS } from 'src/app/core/models/signal-r/innerNote/update-note-structure-ws';
import { NoteUpdateIds } from './note-update-ids';

export interface NoteStructureResult {
  updates: UpdateNoteStructureWS;
  updateIds: NoteUpdateIds[];
}
