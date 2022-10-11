import { ShortUser } from 'src/app/core/models/user/short-user.model';

export type ShortUserPublic = Pick<ShortUser, 'id' | 'name' | 'email' | 'photoId' | 'photoPath'>;
