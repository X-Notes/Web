import { FolderTypeENUM } from 'src/app/shared/enums/folder-types.enum';
import { RefTypeENUM } from 'src/app/shared/enums/ref-type.enum';
import { TreeRGA } from '../../notes/full-note/content-editor/text/rga/tree-rga';

export class BaseFolder {
  id: string;

  title: TreeRGA<string>;

  color: string;

  userId: string;

  isCanEdit: boolean;

  refTypeId: RefTypeENUM;

  folderTypeId: FolderTypeENUM;

  createdAt: Date;

  updatedAt: Date;

  deletedAt: Date;
}
