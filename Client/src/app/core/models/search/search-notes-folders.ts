import { SearchFolders } from './search-folders';
import { SearchNotes } from './search-notes';

export interface SearchNotesFolders {
  noteSearchs: SearchNotes[];
  folderSearchs: SearchFolders[];
}
