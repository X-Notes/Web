import { TypeUploadFile } from './TypeUploadFile.enum';

export interface TransformToFileContent {
  id: string;
  formData: FormData;
  typeFile: TypeUploadFile;
}
