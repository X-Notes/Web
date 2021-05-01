import { SearchFolders } from './searchFolders';
import { SearchNotes } from './SearchNotes';

export interface SearchNotesFolders {
  noteSearchs: SearchNotes[];
  folderSearchs: SearchFolders[];
}
