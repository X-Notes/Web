import { RefType } from 'src/app/core/models/refType';

export interface InvitedUsersToNote {
    id: number;
    photoId: string;
    name: string;
    email: string;
    accessType: RefType;
}
