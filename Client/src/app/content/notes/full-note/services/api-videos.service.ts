import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OperationResult } from 'src/app/shared/models/operation-result.model';
import { environment } from 'src/environments/environment';
import { VideosCollection } from '../../models/content-model.model';

@Injectable()
export class ApiVideosService {
  constructor(private httpClient: HttpClient) {}

  transformToVideos(noteId: string, contentId: string) {
    const obj = {
      noteId,
      contentId,
    };
    return this.httpClient.post<OperationResult<VideosCollection>>(
      `${environment.writeAPI}/api/note/inner/videos/transform`,
      obj,
    );
  }

  removeVideoFromCollection(noteId: string, contentId: string, videoId: string) {
    return this.httpClient.delete<OperationResult<any>>(
      `${environment.writeAPI}/api/note/inner/videos/${noteId}/${contentId}/${videoId}`,
    );
  }

  removeCollection(noteId: string, contentId: string) {
    const obj = {
      noteId,
      contentId,
    };
    return this.httpClient.post<OperationResult<any>>(
      `${environment.writeAPI}/api/note/inner/videos/remove`,
      obj,
    );
  }

  syncContents(noteId: string, videos: VideosCollection[]) {
    const obj = {
      noteId,
      videos,
    };
    return this.httpClient.patch<OperationResult<any>>(
      `${environment.writeAPI}/api/note/inner/videos/sync`,
      obj,
    );
  }

  updateVideosCollectionInfo(noteId: string, contentId: string, name: string) {
    const obj = {
      noteId,
      contentId,
      name,
    };
    return this.httpClient.patch<OperationResult<any>>(
      `${environment.writeAPI}/api/note/inner/videos/info`,
      obj,
    );
  }
}
