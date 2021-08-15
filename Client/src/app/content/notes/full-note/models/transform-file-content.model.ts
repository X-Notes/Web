import { TypeUploadFile } from './enums/type-upload-file.enum';

export interface TransformToFileContent {
  id: string;
  formData: FormData;
  files: File[];
  typeFile: TypeUploadFile;
}
