import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OperationResult } from 'src/app/shared/models/operation-result.model';
import { environment } from 'src/environments/environment';
import { PhotosCollection } from '../../models/editor-models/photos-collection';

@Injectable()
export class ApiPhotosService {
  constructor(private httpClient: HttpClient) {}

  transformToAlbum(noteId: string, contentId: string) {
    const obj = {
      noteId,
      contentId,
    };
    return this.httpClient.post<OperationResult<PhotosCollection>>(
      `${environment.writeAPI}/api/note/inner/photos/transform`,
      obj,
    );
  }

  removeCollection(noteId: string, contentId: string) {
    const obj = {
      noteId,
      contentId,
    };
    return this.httpClient.post<OperationResult<any>>(
      `${environment.writeAPI}/api/note/inner/photos/remove`,
      obj,
    );
  }

  removePhotoFromAlbum(noteId: string, contentId: string, photoId: string) {
    return this.httpClient.delete<OperationResult<any>>(
      `${environment.writeAPI}/api/note/inner/photos/${noteId}/${contentId}/${photoId}`,
    );
  }

  syncContents(noteId: string, photos: PhotosCollection[]) {
    const obj = {
      noteId,
      photos,
    };
    return this.httpClient.patch<OperationResult<any>>(
      `${environment.writeAPI}/api/note/inner/photos/sync`,
      obj,
    );
  }

  updateCollectionInfo(
    noteId: string,
    contentId: string,
    name: string,
    count: number,
    width: string,
    height: string,
  ) {
    const obj = {
      noteId,
      contentId,
      name,
      count,
      width,
      height,
    };
    return this.httpClient.patch<OperationResult<any>>(
      `${environment.writeAPI}/api/note/inner/photos/info`,
      obj,
    );
  }
}
