export interface NoteFolderInfo {
  folderId: string;
  folderName: string;
}

export interface BottomNoteContent {
  noteId: string;
  isHasUserOnNote: boolean;
  noteFolderInfos: NoteFolderInfo[];
  totalSize: number;
  snapshotSize: number;
}
