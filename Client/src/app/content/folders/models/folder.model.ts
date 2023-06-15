import { BaseFolder } from './base-folder.model';
import { BottomFolderContent } from './bottom-folder-content.model';
import { PreviewNotesInFolder } from './preview-notes-in-folder.model';

export class SmallFolder extends BaseFolder {
  order!: number;

  previewNotes?: PreviewNotesInFolder[];

  lockRedirect?: boolean;

  isDisplay?: boolean;

  additionalInfo?: BottomFolderContent;
}
