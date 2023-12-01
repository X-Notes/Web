export interface SyncFolderResult {
    folderId: string;
    color: string;
    title: string;
    version: number;
    noteIdsToDelete: string[];
    noteIdsToAdd: string[];
}