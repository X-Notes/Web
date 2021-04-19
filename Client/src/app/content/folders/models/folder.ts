import { EntityRef } from 'src/app/shared/models/entityRef';
import { FolderType } from 'src/app/shared/models/folderType';

export interface SmallFolder {
  id: string;
  title: string;
  color: string;
  refType: EntityRef;
  folderType: FolderType;
  isSelected?: boolean;
  lockRedirect?: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}
