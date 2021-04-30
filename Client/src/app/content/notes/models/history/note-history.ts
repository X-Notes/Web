import { UserHistory } from './user-history';

export interface NoteHistory {
  snapshotTime: Date;
  users: UserHistory[];
  noteVersionId: string;
}
