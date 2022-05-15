import { PreviewNotesInFolder } from 'src/app/content/folders/models/preview-notes-in-folder.model';
import { PositionEntityModel } from 'src/app/content/notes/models/position-note.model';

export interface UpdateFolderWS {
  folderId: string;
  color: string;
  title: string;
  isUpdateTitle: string;
  previewNotes: PreviewNotesInFolder[];
  idsToRemove: string[];
  idsToAdd: string[];
  positions: PositionEntityModel[];
}
