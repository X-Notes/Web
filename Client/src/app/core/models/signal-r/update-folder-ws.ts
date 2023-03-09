import { PreviewNotesInFolder } from 'src/app/content/folders/models/preview-notes-in-folder.model';
import { MergeTransaction } from 'src/app/content/notes/full-note/content-editor/text/rga/types';
import { PositionEntityModel } from 'src/app/content/notes/models/position-note.model';

export interface UpdateFolderWS {
  folderId: string;
  color: string;
  titleTransactions: MergeTransaction<string>[];
  isUpdateTitle: string;
  previewNotes: PreviewNotesInFolder[];
  idsToRemove: string[];
  idsToAdd: string[];
  positions: PositionEntityModel[];
}
