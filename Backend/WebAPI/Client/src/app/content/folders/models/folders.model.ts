import { FolderTypeENUM } from 'src/app/shared/enums/folder-types.enum';
import { SmallFolder } from './folder.model';

export class Folders {
  typeFolders: FolderTypeENUM;

  folders: SmallFolder[];

  constructor(typeFolders: FolderTypeENUM, folders: SmallFolder[]) {
    this.typeFolders = typeFolders;
    this.folders = folders;
  }
}
