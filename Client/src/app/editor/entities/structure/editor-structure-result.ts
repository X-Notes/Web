
import { UpdateEditorStructureWS } from '../ws/update-note-structure-ws';
import { EditorUpdateIds } from './editor-update-ids';

export interface EditorStructureResult {
  updates: UpdateEditorStructureWS;
  updateIds: EditorUpdateIds[];
}
