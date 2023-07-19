import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { OperationResult } from 'src/app/shared/models/operation-result.model';
import { environment } from 'src/environments/environment';
import { BaseAddToCollectionItemsCommand } from '../entities/collections/base-add-to-collection-items-command';
import { BaseNoteFileContentApiService } from './base-note-file-content-api.service';
import { BaseRemoveFromCollectionItemsCommand } from '../entities/collections/base-remove-from-collection-items-command';
import { BaseUpdateCollectionInfoCommand } from '../entities/collections/base-update-collection-info-command';
import { AudioModel, ApiAudiosCollection, AudiosCollection } from '../entities/contents/audios-collection';

@Injectable()
export class ApiAudiosService extends BaseNoteFileContentApiService<
  BaseRemoveFromCollectionItemsCommand,
  BaseAddToCollectionItemsCommand,
  BaseUpdateCollectionInfoCommand,
  AudioModel
> {
  static baseApi = `${environment.writeAPI}/api/editor/audios`;

  constructor(httpClient: HttpClient) {
    super(httpClient, ApiAudiosService.baseApi);
  }

  transformTo(noteId: string, contentId: string, connectionId: string) {
    const obj = {
      noteId,
      contentId,
      connectionId
    };
    return this.httpClient
      .post<OperationResult<ApiAudiosCollection>>(`${this.baseApi}/transform`, obj)
      .pipe(
        map((x) => {
          return { ...x, data: new AudiosCollection(x.data, x.data.audios) };
        }),
      );
  }
}
