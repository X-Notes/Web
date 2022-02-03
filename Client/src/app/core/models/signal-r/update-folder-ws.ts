import { PreviewNotesInFolder } from 'src/app/content/folders/models/preview-notes-in-folder.model';

export interface UpdateFolderWS {
  folderId: string;
  color: string;
  title: string;
  previewNotes: PreviewNotesInFolder[];
}
