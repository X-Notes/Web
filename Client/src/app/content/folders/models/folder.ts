import { FolderTypeENUM } from 'src/app/shared/enums/FolderTypesEnum';
import { RefTypeENUM } from 'src/app/shared/enums/refTypeEnum';
import { PreviewNotesInFolder } from './PreviewNotesInFolder';

export interface SmallFolder {
  id: string;
  title: string;
  color: string;
  previewNotes: PreviewNotesInFolder[];
  refTypeId: RefTypeENUM;
  folderTypeId: FolderTypeENUM;
  isSelected?: boolean;
  lockRedirect?: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}
