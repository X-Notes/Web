import { BaseFolder } from './base-folder.model';
import { BottomFolderContent } from './bottom-folder-content.model';
import { PreviewNotesInFolder } from './preview-notes-in-folder.model';

export interface SmallFolder extends BaseFolder {
  order: number;
  userId: string;
  previewNotes: PreviewNotesInFolder[];
  isCanEdit: boolean;
  isSelected?: boolean;
  lockRedirect?: boolean;
  additionalInfo?: BottomFolderContent;
}
