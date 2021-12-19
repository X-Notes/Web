import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OperationResult } from 'src/app/shared/models/operation-result.model';
import { environment } from 'src/environments/environment';
import { AudiosCollection } from '../../models/editor-models/audios-collection';

@Injectable()
export class ApiAudiosService {
  constructor(private httpClient: HttpClient) {}

  transformToPlaylist(noteId: string, contentId: string) {
    const obj = {
      noteId,
      contentId,
    };
    return this.httpClient.post<OperationResult<AudiosCollection>>(
      `${environment.writeAPI}/api/note/inner/audios/transform`,
      obj,
    );
  }

  removePlaylist(noteId: string, contentId: string) {
    const obj = {
      noteId,
      contentId,
    };
    return this.httpClient.post<OperationResult<any>>(
      `${environment.writeAPI}/api/note/inner/audios/remove`,
      obj,
    );
  }

  removeAudioFromPlaylist(noteId: string, contentId: string, audioId: string) {
    return this.httpClient.delete<OperationResult<any>>(
      `${environment.writeAPI}/api/note/inner/audios/${noteId}/${contentId}/${audioId}`,
    );
  }

  updateCollectionInfo(noteId: string, contentId: string, name: string) {
    const obj = {
      noteId,
      contentId,
      name,
    };
    return this.httpClient.patch<OperationResult<any>>(
      `${environment.writeAPI}/api/note/inner/audios/info`,
      obj,
    );
  }

  syncContents(noteId: string, audios: AudiosCollection[]) {
    const obj = {
      noteId,
      audios,
    };
    return this.httpClient.patch<OperationResult<any>>(
      `${environment.writeAPI}/api/note/inner/audios/sync`,
      obj,
    );
  }
}
