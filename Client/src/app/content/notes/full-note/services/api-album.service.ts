import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { OperationResult } from 'src/app/shared/models/operation-result.model';
import { environment } from 'src/environments/environment';
import { PhotosCollection, Photo } from '../../models/content-model.model';

@Injectable()
export class ApiAlbumService {

  constructor(private httpClient: HttpClient) { }

  transformToAlbum(noteId: string, contentId: string) {
    const obj = {
      noteId,
      contentId
    };
    return this.httpClient.post<OperationResult<PhotosCollection>>(`${environment.writeAPI}/api/note/inner/album/transform`, obj);
  }

  removeAlbum(noteId: string, contentId: string) {
    const obj = {
      noteId,
      contentId,
    };
    return this.httpClient.post<OperationResult<any>>(
      `${environment.writeAPI}/api/note/inner/album/remove`,
      obj,
    );
  }

  uploadPhotosToAlbum(data: FormData, id: string, contentId: string) {
    return this.httpClient.post<OperationResult<Photo[]>>(
      `${environment.writeAPI}/api/note/inner/album/upload/${id}/${contentId}`,
      data, { reportProgress: true, observe: 'events' }
    );
  }

  removePhotoFromAlbum(noteId: string, contentId: string, photoId: string) {
    return this.httpClient.delete<OperationResult<any>>(
      `${environment.writeAPI}/api/note/inner/album/photo/${noteId}/${contentId}/${photoId}`,
    );
  }

  updateCountInRow(noteId: string, contentId: string, count: number) {
    const obj = {
      noteId,
      contentId,
      count,
    };
    return this.httpClient.patch<OperationResult<any>>(
      `${environment.writeAPI}/api/note/inner/album/row/count`,
      obj,
    );
  }

  updateAlbumSize(noteId: string, contentId: string, width: string, height: string) {
    const obj = {
      noteId,
      contentId,
      width,
      height,
    };
    return this.httpClient.patch<OperationResult<any>>(
      `${environment.writeAPI}/api/note/inner/album/size`,
      obj,
    );
  }

}
