import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LongTermOperationsHandlerService } from 'src/app/content/long-term-operations-handler/services/long-term-operations-handler.service';
import { byteToMB } from 'src/app/core/defaults/byte-convert';
import { maxRequestFileSize } from 'src/app/core/defaults/constraints';
import { generateFormData, nameForUploadPhotos } from 'src/app/core/defaults/form-data-generator';
import { LoadUsedDiskSpace } from 'src/app/core/stateUser/user-action';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { SnackBarFileProcessHandlerService } from 'src/app/shared/services/snackbar/snack-bar-file-process-handler.service';
import { SnackBarHandlerStatusService } from 'src/app/shared/services/snackbar/snack-bar-handler-status.service';
import { UploadFilesService } from 'src/app/shared/services/upload-files.service';
import { PhotosCollection, Photo } from '../../../models/content-model.model';
import { RemovePhotoFromAlbum } from '../../../models/remove-photo-from-album.model';
import { UploadFileToEntity } from '../../models/upload-files-to-entity';
import { ApiAlbumService } from '../../services/api-album.service';
import { ContentEditorBase } from '../content-editor-base';
import { ContentEditorContentsService } from '../content-editor-contents.service';

@Injectable({
  providedIn: 'root'
})
export class ContentEditorPhotosCollectionService extends ContentEditorBase {

  constructor(
    store: Store, 
    snackBarStatusTranslateService: SnackBarHandlerStatusService,
    uploadFilesService: UploadFilesService,
    longTermOperationsHandler: LongTermOperationsHandlerService,
    snackBarFileProcessingHandler: SnackBarFileProcessHandlerService,
    private apiAlbum: ApiAlbumService,
    contentEditorContentsService: ContentEditorContentsService) {

    super(store, snackBarStatusTranslateService, 
          uploadFilesService, longTermOperationsHandler, snackBarFileProcessingHandler, contentEditorContentsService);

  }

  async transformToAlbum(noteId: string, contentId: string, files: File[]){
    const newAlbumResult = await this.apiAlbum.transformToAlbum(noteId, contentId).toPromise();
    if(newAlbumResult.success){
      const index = this.getIndexOrError(contentId);
      this.transformContentTo(newAlbumResult, index);
      await this.uploadPhotoToAlbumHandler({contentId: newAlbumResult.data.id, files}, noteId);
    }
  }

  uploadPhotoToAlbumHandler = async ($event: UploadFileToEntity, noteId: string) => {

    const isCan = await this.uploadFilesService.isCanUserUploadFiles($event.files)
    if(!isCan){
      return;
    }

    const operation = this.longTermOperationsHandler.getNewUploadToNoteOperation();

    var uploadsRequests = $event.files.map(file => {
      const formData = generateFormData([file], nameForUploadPhotos);
      const mini = this.longTermOperationsHandler.getOperationDetailMiniUploadToNoteOperation(operation);
      return this.apiAlbum.uploadPhotosToAlbum(formData, noteId, $event.contentId)
                          .pipe(x => this.snackBarFileProcessingHandler.trackFileUploadProcess(x, mini));
    });

    let photosResult = await forkJoin(uploadsRequests).toPromise();
    let photos = photosResult.map(x => x.eventBody).filter(x => x.success).map(x => x.data).flat(); 
    
    const index = this.getIndexOrError($event.contentId);
    this.insertPhotosToAlbum(photos, index);

    this.store.dispatch(LoadUsedDiskSpace);

    const unsuccess = photosResult.map(x => x.eventBody).filter(x => !x.success);
    if(unsuccess?.length > 0){
      const lname = this.store.selectSnapshot(UserStore.getUserLanguage);
      unsuccess.forEach(op => {
        this.snackBarStatusTranslateService.validateStatus(lname, op, byteToMB(maxRequestFileSize));
      });
    }
  };

  insertPhotosToAlbum(photos: Photo[], index: number){
    const newPhotos: Photo[] = photos.map(
      (x) =>
        new Photo(
          x.fileId,
          x.photoPathSmall,
          x.photoPathMedium,
          x.photoPathBig,
          false,
          x.name,
          x.authorId,
        ),
    );
    const contentPhotos = (this.contents[index] as PhotosCollection).photos;
    const resultPhotos = [...contentPhotos, ...newPhotos];
    const newAlbum: PhotosCollection = { ...(this.contents[index] as PhotosCollection), photos: resultPhotos };

    this.setContentsItem(newAlbum, index);
  }

  async removePhotoFromAlbumHandler(event: RemovePhotoFromAlbum, noteId: string) {
    
    const resp = await this.apiAlbum
      .removePhotoFromAlbum(noteId, event.contentId, event.photoId)
      .toPromise();

    if (resp.success) {
      const index = this.getIndexOrError(event.contentId);
      const contentPhotos = (this.contents[index] as PhotosCollection).photos;
      if (contentPhotos.length === 1) {
        this.removeItemFromContents(event.contentId);
      } else {
        const newAlbum: PhotosCollection = {
          ...(this.contents[index] as PhotosCollection),
          photos: contentPhotos.filter((x) => x.fileId !== event.photoId),
        };
        this.contents[index] = newAlbum;
      }
      this.store.dispatch(LoadUsedDiskSpace);
    }
  }

  removeAlbumHandler = async (contentId: string, noteId: string) => {
    const resp = await this.apiAlbum.removeAlbum(noteId, contentId).toPromise();
    if (resp.success) {
      this.removeItemFromContents(contentId);
      this.store.dispatch(LoadUsedDiskSpace);
    }
  };

}
