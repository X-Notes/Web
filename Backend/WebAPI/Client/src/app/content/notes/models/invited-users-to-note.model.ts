import { RefTypeENUM } from 'src/app/shared/enums/ref-type.enum';

export interface InvitedUsersToNoteOrFolder {
  id: string;
  photoId?: string;
  photoPath: string;
  name: string;
  email: string;
  accessTypeId: RefTypeENUM;
}
