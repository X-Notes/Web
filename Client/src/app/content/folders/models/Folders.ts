import { FolderTypeENUM } from 'src/app/shared/enums/FolderTypesEnum';
import { SmallFolder } from './folder';

export class Folders {
  typeFolders: FolderTypeENUM;

  folders: SmallFolder[];

  count: number;

  constructor(typeFolders: FolderTypeENUM, folders: SmallFolder[]) {
    this.typeFolders = typeFolders;
    this.folders = folders;
    this.count = folders.length;
  }
}
