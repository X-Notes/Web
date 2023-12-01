import { RefTypeENUM } from 'src/app/shared/enums/ref-type.enum';

export interface UpdatePermissionEntity {
  entityId: string;
  refTypeId: RefTypeENUM;
}
