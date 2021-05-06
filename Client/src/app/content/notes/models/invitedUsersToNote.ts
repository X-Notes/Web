import { EntityRef } from 'src/app/shared/models/entityRef';

export interface InvitedUsersToNoteOrFolder {
  id: string;
  photoId: string;
  name: string;
  email: string;
  accessType: EntityRef;
  accessTypeId: string;
}
