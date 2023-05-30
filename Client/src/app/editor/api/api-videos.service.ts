import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { OperationResult } from 'src/app/shared/models/operation-result.model';
import { environment } from 'src/environments/environment';
import { BaseAddToCollectionItemsCommand } from '../entities/collections/base-add-to-collection-items-command';
import { BaseNoteFileContentApiService } from './base-note-file-content-api.service';
import { BaseRemoveFromCollectionItemsCommand } from '../entities/collections/base-remove-from-collection-items-command';
import { BaseUpdateCollectionInfoCommand } from '../entities/collections/base-update-collection-info-command';
import { VideoModel, VideosCollection, ApiVideosCollection } from '../entities/contents/videos-collection';

@Injectable()
export class ApiVideosService extends BaseNoteFileContentApiService<
  BaseRemoveFromCollectionItemsCommand,
  BaseAddToCollectionItemsCommand,
  BaseUpdateCollectionInfoCommand,
  VideoModel
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
