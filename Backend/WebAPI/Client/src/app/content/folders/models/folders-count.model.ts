import { FolderTypeENUM } from "src/app/shared/enums/folder-types.enum";

export interface FoldersCount {
    folderTypeId: FolderTypeENUM;
    count: number;
}