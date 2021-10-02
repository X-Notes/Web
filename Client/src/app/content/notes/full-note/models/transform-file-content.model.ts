import { TypeUploadFile } from './enums/type-upload-file.enum';

export interface TransformToFileContent {
  contentId: string;
  files: File[];
  typeFile: TypeUploadFile;
}
