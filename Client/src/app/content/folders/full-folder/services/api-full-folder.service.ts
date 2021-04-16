import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SmallNote } from 'src/app/content/notes/models/smallNote';
import { OperationResult } from 'src/app/content/notes/models/TextOperationResult';
import { environment } from 'src/environments/environment';

@Injectable()
export class ApiFullFolderService {
  controllerApi = `${environment.writeAPI}/api/fullfolder`;

  constructor(private httpClient: HttpClient) {}

  getFolderNotes(folderId: string) {
    return this.httpClient.get<SmallNote[]>(`${this.controllerApi}/${folderId}`);
  }

  updateNotesInFolder(noteIds: string[], folderId: string) {
    const obj = {
      noteIds,
      folderId,
    };
    return this.httpClient.patch<OperationResult<any>>(`${this.controllerApi}/update/notes`, obj);
  }

  insertLine(noteIds: string[], folderId: string) {
    const obj = {
      noteIds,
      folderId,
    };
    return this.httpClient.post<OperationResult<any>>(`${this.controllerApi}/remove/notes`, obj);
  }
}
