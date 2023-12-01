import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { OperationResult } from 'src/app/shared/models/operation-result.model';
import { environment } from 'src/environments/environment';
import { BaseAddToCollectionItemsCommand } from '../entities/collections/base-add-to-collection-items-command';
import { UpdatePhotosCollectionInfoCommand } from '../entities/collections/update-photos-collection-info-command';
import { BaseNoteFileContentApiService } from './base-note-file-content-api.service';
import { BaseRemoveFromCollectionItemsCommand } from '../entities/collections/base-remove-from-collection-items-command';
import { Photo, ApiPhotosCollection, PhotosCollection } from '../entities/contents/photos-collection';

@Injectable()
export class ApiPhotosService extends BaseNoteFileContentApiService<
  BaseRemoveFromCollectionItemsCommand,
  BaseAddToCollectionItemsCommand,
  UpdatePhotosCollectionInfoCommand,
  Photo
> {
  static baseApi = `${environment.api}/api/editor/photos`;

  constructor(httpClient: HttpClient) {
    super(httpClient, ApiPhotosService.baseApi);
  }

  transformTo(noteId: string, contentId: string, connectionId: string) {
    const obj = {
      noteId,
      contentId,
      connectionId
    };
    return this.httpClient
      .post<OperationResult<ApiPhotosCollection>>(`${this.baseApi}/transform`, obj)
      .pipe(
        map((x) => {
          return { ...x, data: new PhotosCollection(x.data, x.data.photos) };
        }),
      );
  }
}
