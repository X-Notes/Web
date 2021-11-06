import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OperationResult } from 'src/app/shared/models/operation-result.model';
import { environment } from 'src/environments/environment';
import { DocumentModel, DocumentsCollection } from '../../models/content-model.model';

@Injectable()
export class ApiDocumentsService {
  constructor(private httpClient: HttpClient) {}

  transformToDocuments(noteId: string, contentId: string) {
    const obj = {
      noteId,
      contentId,
    };
    return this.httpClient.post<OperationResult<DocumentsCollection>>(
      `${environment.writeAPI}/api/note/inner/documents/transform`,
      obj,
    );
  }

  uploadDocumentsToCollection(data: FormData, id: string, contentId: string) {
    return this.httpClient.post<OperationResult<DocumentModel[]>>(
      `${environment.writeAPI}/api/note/inner/documents/upload/${id}/${contentId}`,
      data,
      { reportProgress: true, observe: 'events' },
    );
  }

  removeDocumentFromNote(noteId: string, contentId: string) {
    const obj = {
      noteId,
      contentId,
    };
    return this.httpClient.post<OperationResult<any>>(
      `${environment.writeAPI}/api/note/inner/documents/remove`,
      obj,
    );
  }

  syncContents(noteId: string, documents: DocumentsCollection[]) {
    const obj = {
      noteId,
      documents
    };
    return this.httpClient.patch<OperationResult<any>>(
      `${environment.writeAPI}/api/note/inner/documents/sync`,
      obj,
    );
  }
}
