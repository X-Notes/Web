import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OperationResult } from 'src/app/shared/models/operation-result.model';
import { environment } from 'src/environments/environment';
import { DocumentModel } from '../../models/content-model.model';

@Injectable()
export class ApiDocumentService {

  constructor(private httpClient: HttpClient) { }

  
  insertFilesToNote(data: FormData, id: string, contentId: string) {
    return this.httpClient.post<OperationResult<DocumentModel>>(
      `${environment.writeAPI}/api/fullnote/files/${id}/${contentId}`,
      data, { reportProgress: true, observe: 'events' }
    );
  }

  removeFileFromNote(noteId: string, contentId: string) {
    const obj = {
      noteId,
      contentId,
    };
    return this.httpClient.post<OperationResult<any>>(
      `${environment.writeAPI}/api/fullnote/files/remove`,
      obj,
    );
  }
  
}
