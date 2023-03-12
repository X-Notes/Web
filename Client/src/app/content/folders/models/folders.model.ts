import { FolderTypeENUM } from 'src/app/shared/enums/folder-types.enum';
import { SmallFolder } from './folder.model';

export class Folders {
  typeFolders: FolderTypeENUM;

  folders: SmallFolder[];

  count: number;

  constructor(typeFolders: FolderTypeENUM, folders: SmallFolder[]) {
    this.typeFolders = typeFolders;
    this.validate(folders);
    this.folders = folders;
    this.count = folders.length;
  }

  validate(notes: SmallFolder[]): void {
    notes.forEach((note) => {
      if (!note.title.isContainsMethods) {
        throw new Error('Title invalid');
      }
    });
  }
}
