import { FolderTypeENUM } from 'src/app/shared/enums/folder-types.enum';
import { RefTypeENUM } from 'src/app/shared/enums/ref-type.enum';

export interface BaseFolder {
  id: string;
  title: string;
  color: string;
  refTypeId: RefTypeENUM;
  folderTypeId: FolderTypeENUM;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}
