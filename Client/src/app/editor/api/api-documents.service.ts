import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { OperationResult } from 'src/app/shared/models/operation-result.model';
import { environment } from 'src/environments/environment';
import { BaseNoteFileContentApiService } from './base-note-file-content-api.service';
import { BaseAddToCollectionItemsCommand } from '../entities/collections/base-add-to-collection-items-command';
import { BaseRemoveFromCollectionItemsCommand } from '../entities/collections/base-remove-from-collection-items-command';
import { BaseUpdateCollectionInfoCommand } from '../entities/collections/base-update-collection-info-command';
import { DocumentModel, ApiDocumentsCollection, DocumentsCollection } from '../entities/contents/documents-collection';

@Injectable()
export class ApiDocumentsService extends BaseNoteFileContentApiService<
  BaseRemoveFromCollectionItemsCommand,
  BaseAddToCollectionItemsCommand,
  BaseUpdateCollectionInfoCommand,
  DocumentModel
> {
  static baseApi = `${environment.writeAPI}/api/editor/documents`;

  constructor(httpClient: HttpClient) {
    super(httpClient, ApiDocumentsService.baseApi);
  }

  transformTo(noteId: string, contentId: string, connectionId: string) {
    const obj = {
      noteId,
      contentId,
      connectionId
    };
    return this.httpClient
      .post<OperationResult<ApiDocumentsCollection>>(`${this.baseApi}/transform`, obj)
      .pipe(
        map((x) => {
          return { ...x, data: new DocumentsCollection(x.data, x.data.documents) };
        }),
      );
  }
}
