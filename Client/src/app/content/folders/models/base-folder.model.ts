import { FolderTypeENUM } from 'src/app/shared/enums/folder-types.enum';
import { RefTypeENUM } from 'src/app/shared/enums/ref-type.enum';

export class BaseFolder {
  id!: string;

  title?: string;

  color!: string;

  userId!: string;

  isCanEdit!: boolean;

  refTypeId!: RefTypeENUM;

  folderTypeId!: FolderTypeENUM;

  createdAt!: Date;

  updatedAt!: Date;

  version!: number;

  deletedAt!: Date;
}
