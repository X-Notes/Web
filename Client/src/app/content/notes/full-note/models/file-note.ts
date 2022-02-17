import { FileNoteMetaData } from './file-note-metadata';

export interface FileNote {
  id: string;
  pathPhotoSmall: string;
  pathPhotoMedium: string;
  pathPhotoBig: string;
  pathNonPhotoContent: string;
  authorId: string;
  createdAt: Date;
  name: string;
  metaData: FileNoteMetaData;
}
