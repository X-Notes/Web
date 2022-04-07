import { FolderTypeENUM } from 'src/app/shared/enums/folder-types.enum';
import { RefTypeENUM } from 'src/app/shared/enums/ref-type.enum';
import { BottomFolderContent } from './bottom-folder-content.model';
import { PreviewNotesInFolder } from './preview-notes-in-folder.model';

export interface SmallFolder {
  id: string;
  title: string;
  color: string;
  order: number;
  userId: string;
  previewNotes: PreviewNotesInFolder[];
  refTypeId: RefTypeENUM;
  isCanEdit: boolean;
  folderTypeId: FolderTypeENUM;
  isSelected?: boolean;
  lockRedirect?: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  additionalInfo?: BottomFolderContent;
}
