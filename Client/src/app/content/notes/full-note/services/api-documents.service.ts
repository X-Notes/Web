import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, tap } from 'rxjs/operators';
import { OperationResult } from 'src/app/shared/models/operation-result.model';
import { environment } from 'src/environments/environment';
import { ApiDocumentsCollection, DocumentsCollection } from '../../models/editor-models/documents-collection';
import { BaseAddToCollectionItemsCommand } from '../models/api/base-add-to-collection-items-command';
import { BaseRemoveFromCollectionItemsCommand } from '../models/api/base-remove-from-collection-items-command';
import { BaseUpdateCollectionInfoCommand } from '../models/api/base-update-collection-info-command';
import { BaseNoteFileContentApiService } from './base-note-file-content-api.service';

@Injectable()
export class ApiDocumentsService extends BaseNoteFileContentApiService
  <
  BaseRemoveFromCollectionItemsCommand, 
  BaseAddToCollectionItemsCommand, 
  BaseUpdateCollectionInfoCommand
  >    
{

  static baseApi = `${environment.writeAPI}/api/note/inner/documents`;

  constructor(httpClient: HttpClient) {
    super(httpClient, ApiDocumentsService.baseApi)
  }

  transformTo(noteId: string, contentId: string) {
    const obj = {
      noteId,
      contentId,
    };
    return this.httpClient.post<OperationResult<ApiDocumentsCollection>>(`${this.baseApi}/transform`, obj)
                          .pipe(map(x => { return { ...x, data: new DocumentsCollection(x.data, x.data.documents) }; }));
  }
}
