import { RefTypeENUM } from 'src/app/shared/enums/refTypeEnum';

export interface InvitedUsersToNoteOrFolder {
    id: string;
    photoId: string;
    name: string;
    email: string;
    accessType: RefTypeENUM;
}
