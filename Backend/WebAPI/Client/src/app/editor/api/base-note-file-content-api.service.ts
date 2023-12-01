import { HttpClient } from '@angular/common/http';
import { OperationResult } from 'src/app/shared/models/operation-result.model';
import { BaseAddToCollectionItemsCommand } from '../entities/collections/base-add-to-collection-items-command';
import { BaseGetNoteFilesByIdsQuery } from '../entities/files/base-get-note-files-byIds-query';
import { CollectionUpdateResult } from '../entities/collections/collection-update-result';
import { BaseRemoveFromCollectionItemsCommand } from '../entities/collections/base-remove-from-collection-items-command';
import { BaseUpdateCollectionInfoCommand } from '../entities/collections/base-update-collection-info-command';
import { BaseFile } from '../entities/contents/base-file';

export class BaseNoteFileContentApiService<
  Y extends BaseRemoveFromCollectionItemsCommand,
  U extends BaseAddToCollectionItemsCommand,
  I extends BaseUpdateCollectionInfoCommand,
  File extends BaseFile,
> {
  constructor(protected httpClient: HttpClient, protected baseApi: string) {}

  removeItemsFromCollection(command: Y) {
    return this.httpClient.post<OperationResult<CollectionUpdateResult>>(`${this.baseApi}/remove`, command);
  }

  addItemsToCollection(command: U) {
    return this.httpClient.post<OperationResult<CollectionUpdateResult>>(`${this.baseApi}/add`, command);
  }

  updateInfo(command: I) {
    return this.httpClient.patch<OperationResult<CollectionUpdateResult>>(`${this.baseApi}/info`, command);
  }

  getFilesByIds(query: BaseGetNoteFilesByIdsQuery) {
    return this.httpClient.post<File[]>(`${this.baseApi}/get/files`, query);
  }
}
