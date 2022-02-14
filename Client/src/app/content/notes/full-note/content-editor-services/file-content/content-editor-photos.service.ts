import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { forkJoin } from 'rxjs';
import { LongTermOperationsHandlerService } from 'src/app/content/long-term-operations-handler/services/long-term-operations-handler.service';
import { generateFormData } from 'src/app/core/defaults/form-data-generator';
import { SnackBarFileProcessHandlerService } from 'src/app/shared/services/snackbar/snack-bar-file-process-handler.service';
import { SnackBarHandlerStatusService } from 'src/app/shared/services/snackbar/snack-bar-handler-status.service';
import { UploadFilesService } from 'src/app/shared/services/upload-files.service';
import { finalize, takeUntil } from 'rxjs/operators';
import { LongTermsIcons } from 'src/app/content/long-term-operations-handler/models/long-terms.icons';
import { UploadFileToEntity } from '../../models/upload-files-to-entity';
import { ApiPhotosService } from '../../services/api-photos.service';
import { ContentEditorFilesBase } from './content-editor-files-base';
import { ContentEditorContentsService } from '../content-editor-contents.service';
import { ApiNoteFilesService } from '../../services/api-note-files.service';
import { FileNoteTypes } from '../../models/file-note-types.enum';
import { Photo, PhotosCollection } from '../../../models/editor-models/photos-collection';

@Injectable()
export class ContentEditorPhotosCollectionService extends ContentEditorFilesBase {
  constructor(
    store: Store,
    snackBarStatusTranslateService: SnackBarHandlerStatusService,
    uploadFilesService: UploadFilesService,
    longTermOperationsHandler: LongTermOperationsHandlerService,
    snackBarFileProcessingHandler: SnackBarFileProcessHandlerService,
    private apiPhotos: ApiPhotosService,
    contentEditorContentsService: ContentEditorContentsService,
    private apiFiles: ApiNoteFilesService,
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
    const collectionResult = await this.apiPhotos.transformTo(noteId, contentId).toPromise();
    if (collectionResult.success) {
      collectionResult.data.isLoading = true; // TODO TRY CATCH
      this.transformContentToOrWarning(collectionResult, contentId);
      await this.uploadPhotoToAlbumHandler({ contentId: collectionResult.data.id, files }, noteId);
      collectionResult.data.isLoading = false;
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
      const formData = generateFormData(file);
      const mini = this.longTermOperationsHandler.getNewMini(
        operation,
        LongTermsIcons.Image,
        file.name,
      );
      return this.apiFiles.uploadFilesToNote(formData, noteId, FileNoteTypes.Photo).pipe(
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

    const photosMapped = photos.map(
      (x) =>
        new Photo(
          x.id,
          x.pathPhotoSmall,
          x.pathPhotoMedium,
          x.pathPhotoBig,
          false,
          x.name,
          x.authorId,
          x.createdAt,
        ),
    );
    const collection = this.contentsService.getContentById<PhotosCollection>($event.contentId);
    this.insertPhotosToAlbum(photosMapped, collection, $event.contentId);

    this.afterUploadFilesToCollection(photosResult);
  };

  insertPhotosToAlbum(photos: Photo[], prevCollection: PhotosCollection, contentId: string) {
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
          x.uploadAt,
        ),
    );
    const prev = prevCollection.items ?? [];

    const newCollection = new PhotosCollection(prevCollection, prevCollection.items);
    newCollection.items = [...prev, ...newPhotos];

    this.contentsService.setSafe(newCollection, contentId);
  }

  deletePhotoHandler(photoId: string, content: PhotosCollection) {
    if (content.items.length === 1) {
      this.deleteHandler(content.id);
    } else {
      content.items = content.items.filter((x) => x.fileId !== photoId);
    }
  }
}
