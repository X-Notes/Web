import { UpdatePermissionEntity } from './update-permission-entity';

export interface UpdatePermissionBase {
  revokeIds: string[];
  idsToAdd: string[];
  updatePermissions: UpdatePermissionEntity[];
}
