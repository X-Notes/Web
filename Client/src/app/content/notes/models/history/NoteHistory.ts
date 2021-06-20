import { UserHistory } from './UserHistory';

export interface NoteHistory {
  snapshotTime: Date;
  users: UserHistory[];
  noteVersionId: string;
}
