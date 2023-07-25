export interface NoteFolderInfo {
  folderId: string;
  folderName: string;
}

export interface RelatedNotesInfo {
  noteId: string;
  name: string;
}

export interface BottomNoteContent {
  noteId: string;
  isHasUserOnNote: boolean;
  noteFolderInfos: NoteFolderInfo[];
  noteRelatedNotes: RelatedNotesInfo[];
  totalSize: number;
}
