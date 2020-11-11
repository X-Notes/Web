import { FolderType } from 'src/app/shared/enums/FolderTypes';
import { Folder } from './folder';

export class Folders {
    typeFolders: FolderType;
    folders: Folder[];
    count: number;
    constructor(typeFolders: FolderType, folders: Folder[]) {
        this.typeFolders = typeFolders;
        this.folders = folders;
        this.count = folders.length;
    }
}
