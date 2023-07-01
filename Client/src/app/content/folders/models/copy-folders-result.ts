import { SmallFolder } from "./folder.model";

export interface CopyFoldersResult {
    folders: SmallFolder[];
    noteIds: string[];
}