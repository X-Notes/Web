import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OperationResult } from 'src/app/shared/models/operation-result.model';
import { environment } from 'src/environments/environment';
import { VideoModel } from '../../models/content-model.model';

@Injectable()
export class ApiVideoService {

  constructor(private httpClient: HttpClient) { }

  insertVideosToNote(data: FormData, id: string, contentId: string) {
    return this.httpClient.post<OperationResult<VideoModel>>(`${environment.writeAPI}/api/fullnote/videos/${id}/${contentId}`, 
                                    data, { reportProgress: true, observe: 'events' });
  }

  removeVideoFromNote(noteId: string, contentId: string) {
    const obj = {
      noteId,
      contentId,
    };
    return this.httpClient.post<OperationResult<any>>(
      `${environment.writeAPI}/api/fullnote/videos/remove`,
      obj,
    );
  }

}
