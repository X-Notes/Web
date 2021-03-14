import { EntityRef } from './entityRef';
import { FolderType } from './folderType';
import { FontSize } from './FontSize';
import { LanguageDTO } from './LanguageDTO';
import { NoteType } from './noteType';
import { Theme } from './Theme';

export interface GeneralApp {
  folderTypes: FolderType[];
  noteTypes: NoteType[];
  refs: EntityRef[];
  themes: Theme[];
  fontSizes: FontSize[];
  languages: LanguageDTO[];
}
