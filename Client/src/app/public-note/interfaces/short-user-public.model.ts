import { ShortUser } from '../../core/models/short-user.model';

export type ShortUserPublic = Pick<ShortUser, 'id' | 'name' | 'email' | 'photoId' | 'photoPath'>;
