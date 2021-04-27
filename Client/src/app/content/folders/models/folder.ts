import { EntityRef } from 'src/app/shared/models/entityRef';
import { FolderType } from 'src/app/shared/models/folderType';
import { PreviewNotesInFolder } from './PreviewNotesInFolder';

export interface SmallFolder {
  id: string;
  title: string;
  color: string;
  previewNotes: PreviewNotesInFolder[];
  refType: EntityRef;
  folderType: FolderType;
  isSelected?: boolean;
  lockRedirect?: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}
