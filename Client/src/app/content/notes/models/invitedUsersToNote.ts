import { RefType } from 'src/app/core/models/refType';

export interface InvitedUsersToNoteOrFolder {
    id: number;
    photoId: string;
    name: string;
    email: string;
    accessType: RefType;
}
