import { UserHistory } from './user-history.model';

export interface NoteHistory {
  snapshotTime: Date;
  users: UserHistory[];
  noteVersionId: string;
}
