import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
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
import { ContentEditorContentsService } from '../core/content-editor-contents.service';
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

  async transformToPhotosCollection(
    noteId: string,
    contentId: string,
    files: File[],
  ): Promise<string> {
    const collectionResult = await this.apiPhotos.transformTo(noteId, contentId).toPromise();
    if (collectionResult.success) {
      collectionResult.data.isLoading = true; // TODO TRY CATCH
      this.transformContentToOrWarning(collectionResult, contentId);
      await this.uploadPhotosToCollectionHandler(
        { contentId: collectionResult.data.id, files },
        noteId,
      );
      collectionResult.data.isLoading = false;
      return collectionResult.data.id;
    }
    return null;
  }

  uploadPhotosToCollectionHandler = async ($event: UploadFileToEntity, noteId: string) => {
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

    let collection = this.contentsService.getContentById<PhotosCollection>($event.contentId);
    collection.isLoading = true;

    const results = await this.uploadFilesParallel(uploadsRequests);
    if (!results) {
      collection.isLoading = false;
      return;
    }

    const photos = this.mapFiles(results);

    this.afterUploadFilesToCollection(results);
    if (!photos || photos.length === 0) {
      collection.isLoading = false;
      return;
    }

    const photosMapped = photos.map(
      (x) =>
        new Photo({
          ...x,
          loaded: false,
          fileId: x.id,
          uploadAt: x.createdAt,
          photoPathBig: x.buildPath(x.pathSuffixes.large) || x.buildPath(x.pathSuffixes.default),
          photoPathMedium: x.buildPath(x.pathSuffixes.medium),
          photoPathSmall: x.buildPath(x.pathSuffixes.small),
        }),
    );

    collection = this.contentsService.getContentById<PhotosCollection>($event.contentId);
    collection.addItemsToCollection(photosMapped);
    collection.isLoading = false;
  };

  deletePhotoHandler(photoId: string, content: PhotosCollection) {
    if (content.items.length === 1) {
      this.deleteHandler(content.id);
    } else {
      // eslint-disable-next-line no-param-reassign
      content.items = content.items.filter((x) => x.fileId !== photoId);
    }
  }
}
