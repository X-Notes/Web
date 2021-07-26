import { NoteSnapshot } from './note-snapshot.model';

export interface NoteSnapshotState {
  canView: boolean;
  noteSnapshot: NoteSnapshot;
}
