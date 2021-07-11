import { SearchFolders } from './SearchFolders';
import { SearchNotes } from './SearchNotes';

export interface SearchNotesFolders {
  noteSearchs: SearchNotes[];
  folderSearchs: SearchFolders[];
}
