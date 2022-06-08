import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { OperationResult } from 'src/app/shared/models/operation-result.model';
import { environment } from 'src/environments/environment';
import {
  ApiPhotosCollection,
  Photo,
  PhotosCollection,
} from '../../models/editor-models/photos-collection';
import { BaseAddToCollectionItemsCommand } from '../models/api/base-add-to-collection-items-command';
import { BaseRemoveFromCollectionItemsCommand } from '../models/api/base-remove-from-collection-items-command';
import { UpdatePhotosCollectionInfoCommand } from '../models/api/photos/update-photos-collection-info-command';
import { BaseNoteFileContentApiService } from './base-note-file-content-api.service';

@Injectable()
export class ApiPhotosService extends BaseNoteFileContentApiService<
  BaseRemoveFromCollectionItemsCommand,
  BaseAddToCollectionItemsCommand,
  UpdatePhotosCollectionInfoCommand,
  Photo
> {
  static baseApi = `${environment.writeAPI}/api/note/inner/photos`;

  constructor(httpClient: HttpClient) {
    super(httpClient, ApiPhotosService.baseApi);
  }

  transformTo(noteId: string, contentId: string) {
    const obj = {
      noteId,
      contentId,
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
