import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OperationResult } from 'src/app/shared/models/operation-result.model';
import { environment } from 'src/environments/environment';
import { FileNoteTypes } from '../models/file-note-types.enum';

@Injectable({
  providedIn: 'root',
})
export class ApiNoteFilesService {
  constructor(private httpClient: HttpClient) {}

  uploadFilesToNote(data: FormData, noteId: string, fileType: FileNoteTypes) {
    return this.httpClient.post<OperationResult<string[]>>(
      `${environment.writeAPI}/api/note/inner/files/upload/${noteId}/${fileType}`,
      data,
      { reportProgress: true, observe: 'events' },
    );
  }
}
