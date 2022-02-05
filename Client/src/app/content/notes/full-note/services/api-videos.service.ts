import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { OperationResult } from 'src/app/shared/models/operation-result.model';
import { environment } from 'src/environments/environment';
import {
  ApiVideosCollection,
  VideosCollection,
} from '../../models/editor-models/videos-collection';
import { BaseAddToCollectionItemsCommand } from '../models/api/base-add-to-collection-items-command';
import { BaseRemoveFromCollectionItemsCommand } from '../models/api/base-remove-from-collection-items-command';
import { BaseUpdateCollectionInfoCommand } from '../models/api/base-update-collection-info-command';
import { BaseNoteFileContentApiService } from './base-note-file-content-api.service';

@Injectable()
export class ApiVideosService extends BaseNoteFileContentApiService<
  BaseRemoveFromCollectionItemsCommand,
  BaseAddToCollectionItemsCommand,
  BaseUpdateCollectionInfoCommand
> {
  static baseApi = `${environment.writeAPI}/api/note/inner/videos`;

  constructor(httpClient: HttpClient) {
    super(httpClient, ApiVideosService.baseApi);
  }

  transformTo(noteId: string, contentId: string): Observable<OperationResult<VideosCollection>> {
    const obj = {
      noteId,
      contentId,
    };
    return this.httpClient
      .post<OperationResult<ApiVideosCollection>>(`${this.baseApi}/transform`, obj)
      .pipe(
        map((x) => {
          return { ...x, data: new VideosCollection(x.data, x.data.videos) };
        }),
      );
  }
}
