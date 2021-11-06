import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OperationResult } from 'src/app/shared/models/operation-result.model';
import { environment } from 'src/environments/environment';
import { VideoModel, VideosCollection } from '../../models/content-model.model';

@Injectable()
export class ApiVideoService {
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

  uploadVideosToCollection(data: FormData, id: string, contentId: string) {
    return this.httpClient.post<OperationResult<VideoModel[]>>(
      `${environment.writeAPI}/api/note/inner/videos/upload/${id}/${contentId}`,
      data,
      { reportProgress: true, observe: 'events' },
    );
  }

  removeVideoFromNote(noteId: string, contentId: string) {
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
      videos
    };
    return this.httpClient.patch<OperationResult<any>>(
      `${environment.writeAPI}/api/note/inner/videos/sync`,
      obj,
    );
  }
}
