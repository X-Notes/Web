import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OperationResult } from 'src/app/shared/models/operation-result.model';
import { environment } from 'src/environments/environment';
import { FileNote } from '../entities/files/file-note';
import { FileNoteTypes } from '../entities/files/file-note-types.enum';
@Injectable({
  providedIn: 'root',
})
export class ApiNoteFilesService {
  constructor(private httpClient: HttpClient) {}

  uploadFilesToNote(data: FormData, noteId: string, fileType: FileNoteTypes) {
    return this.httpClient.post<OperationResult<FileNote[]>>(
      `${environment.writeAPI}/api/note/inner/files/upload/${noteId}/${fileType}`,
      data,
      { reportProgress: true, observe: 'events' },
    );
  }

  uploadFilesToNoteNoProgressReport(data: FormData, noteId: string, fileType: FileNoteTypes) {
    return this.httpClient.post<OperationResult<FileNote[]>>(
      `${environment.writeAPI}/api/note/inner/files/upload/${noteId}/${fileType}`,
      data,
    );
  }

  updateFileMetaData(fileId: string, secondsDuration: number, imageFileId: string) {
    const obj = {
      fileId,
      secondsDuration,
      imageFileId,
    };
    return this.httpClient.patch<OperationResult<FileNote>>(
      `${environment.writeAPI}/api/note/inner/files/metadata`,
      obj,
    );
  }
}
