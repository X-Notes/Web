import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OperationResult } from 'src/app/shared/models/operation-result.model';
import { environment } from 'src/environments/environment';
import { AudioModel, PlaylistModel } from '../../models/content-model.model';

@Injectable()
export class ApiPlaylistService {

  constructor(private httpClient: HttpClient) { }

  
  insertAudiosToNote(data: FormData, id: string, contentId: string) {
    return this.httpClient.post<OperationResult<PlaylistModel>>(
      `${environment.writeAPI}/api/note/inner/audios/${id}/${contentId}`,
      data, { reportProgress: true, observe: 'events' }
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

  changePlaylistName(noteId: string, contentId: string, name: string) {
    const obj = {
      noteId,
      contentId,
      name,
    };
    return this.httpClient.patch<OperationResult<any>>(
      `${environment.writeAPI}/api/note/inner/audios/name`,
      obj,
    );
  }

  uploadAudiosToPlaylist(data: FormData, id: string, contentId: string) {
    return this.httpClient.post<OperationResult<AudioModel[]>>(
      `${environment.writeAPI}/api/note/inner/audios/upload/${id}/${contentId}`,
      data,
    );
  }
}
