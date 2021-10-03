import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { forkJoin } from 'rxjs';
import { LongTermOperationsHandlerService } from 'src/app/content/long-term-operations-handler/services/long-term-operations-handler.service';
import { generateFormData, nameForUploadPhotos } from 'src/app/core/defaults/form-data-generator';
import { LoadUsedDiskSpace } from 'src/app/core/stateUser/user-action';
import { SnackBarFileProcessHandlerService } from 'src/app/shared/services/snackbar/snack-bar-file-process-handler.service';
import { SnackBarHandlerStatusService } from 'src/app/shared/services/snackbar/snack-bar-handler-status.service';
import { UploadFilesService } from 'src/app/shared/services/upload-files.service';
import { finalize, takeUntil } from 'rxjs/operators';
import { LongTermsIcons } from 'src/app/content/long-term-operations-handler/models/long-terms.icons';
import { PhotosCollection, Photo } from '../../../models/content-model.model';
import { UploadFileToEntity } from '../../models/upload-files-to-entity';
import { ApiAlbumService } from '../../services/api-album.service';
import { ContentEditorFilesBase } from './content-editor-files-base';
import { ContentEditorContentsService } from '../content-editor-contents.service';

@Injectable({
  providedIn: 'root',
})
export class ContentEditorPhotosCollectionService extends ContentEditorFilesBase {
  constructor(
    store: Store,
    snackBarStatusTranslateService: SnackBarHandlerStatusService,
    uploadFilesService: UploadFilesService,
    longTermOperationsHandler: LongTermOperationsHandlerService,
    snackBarFileProcessingHandler: SnackBarFileProcessHandlerService,
    private apiAlbum: ApiAlbumService,
    contentEditorContentsService: ContentEditorContentsService,
  ) {
    super(
      store,
      snackBarStatusTranslateService,
      uploadFilesService,
      longTermOperationsHandler,
      snackBarFileProcessingHandler,
      contentEditorContentsService,
    );
  }

  async transformToPhotosCollection(noteId: string, contentId: string, files: File[]) {
    const newAlbumResult = await this.apiAlbum.transformToAlbum(noteId, contentId).toPromise();
    if (newAlbumResult.success) {
      this.transformContentTo(newAlbumResult, contentId);
      await this.uploadPhotoToAlbumHandler({ contentId: newAlbumResult.data.id, files }, noteId);
    }
  }

  uploadPhotoToAlbumHandler = async ($event: UploadFileToEntity, noteId: string) => {
    const isCan = await this.uploadFilesService.isCanUserUploadFiles($event.files);
    if (!isCan) {
      return;
    }

    const operation = this.longTermOperationsHandler.addNewUploadToNoteOperation(
      'uploader.uploadingPhotosNoteLong',
      'uploader.uploading',
      'uploader.uploadingPhotosNote',
    );

    const uploadsRequests = $event.files.map((file) => {
      const formData = generateFormData([file], nameForUploadPhotos);
      const mini = this.longTermOperationsHandler.getNewMini(
        operation,
        LongTermsIcons.Image,
        file.name,
      );
      return this.apiAlbum.uploadPhotosToAlbum(formData, noteId, $event.contentId).pipe(
        finalize(() => this.longTermOperationsHandler.finalize(operation, mini)),
        takeUntil(mini.obs),
        (x) => this.snackBarFileProcessingHandler.trackProcess(x, mini),
      );
    });

    const photosResult = await forkJoin(uploadsRequests).toPromise();
    const photos = photosResult
      .map((x) => x.eventBody)
      .filter((x) => x?.success)
      .map((x) => x?.data)
      .flat();

    if (!photos || photos.length === 0) {
      return;
    }

    const collection = this.contentsService.getContentById<PhotosCollection>($event.contentId);
    this.insertPhotosToAlbum(photos, collection, $event.contentId);

    this.afterUploadFilesToCollection(photosResult);
  };

  insertPhotosToAlbum(photos: Photo[], collection: PhotosCollection, contentId: string) {
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
    const prev = collection.photos ?? [];
    const newCollection: PhotosCollection = { ...collection, photos: [...prev, ...newPhotos] };
    this.contentsService.setSafe(newCollection, contentId);
  }

  deleteContentHandler = async (contentId: string, noteId: string) => {
    const resp = await this.apiAlbum.removeAlbum(noteId, contentId).toPromise();
    if (resp.success) {
      this.deleteHandler(contentId);
    }
  };

  async deletePhotoHandler(photoId: string, contentId: string, noteId: string) {
    const resp = await this.apiAlbum.removePhotoFromAlbum(noteId, contentId, photoId).toPromise();

    if (resp.success) {
      const collection = this.contentsService.getContentById<PhotosCollection>(contentId);
      if (collection.photos.length === 1) {
        this.deleteHandler(contentId);
      } else {
        const newCollection: PhotosCollection = {
          ...collection,
          photos: collection.photos.filter((x) => x.fileId !== photoId),
        };
        this.contentsService.setSafe(newCollection, contentId);
      }
      this.store.dispatch(LoadUsedDiskSpace);
    }
  }
}
