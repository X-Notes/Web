import { HttpClient } from '@angular/common/http';
import { OperationResult } from 'src/app/shared/models/operation-result.model';
import { BaseFile } from '../../models/editor-models/base-file';
import { BaseAddToCollectionItemsCommand } from '../models/api/base-add-to-collection-items-command';
import { BaseGetNoteFilesByIdsQuery } from '../models/api/base-get-note-files-byIds-query';
import { BaseRemoveFromCollectionItemsCommand } from '../models/api/base-remove-from-collection-items-command';
import { BaseUpdateCollectionInfoCommand } from '../models/api/base-update-collection-info-command';

export class BaseNoteFileContentApiService<
  Y extends BaseRemoveFromCollectionItemsCommand,
  U extends BaseAddToCollectionItemsCommand,
  I extends BaseUpdateCollectionInfoCommand,
  File extends BaseFile,
> {
  constructor(protected httpClient: HttpClient, protected baseApi: string) {}

  removeItemsFromCollection(command: Y) {
    return this.httpClient.post<OperationResult<any>>(`${this.baseApi}/remove`, command);
  }

  addItemsToCollection(command: U) {
    return this.httpClient.post<OperationResult<any>>(`${this.baseApi}/add`, command);
  }

  updateInfo(command: I) {
    return this.httpClient.patch<OperationResult<any>>(`${this.baseApi}/info`, command);
  }

  getFilesByIds(query: BaseGetNoteFilesByIdsQuery) {
    return this.httpClient.post<File[]>(`${this.baseApi}/get/files`, query);
  }
}
