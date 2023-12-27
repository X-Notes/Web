import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { LongTermOperationsHandlerService } from 'src/app/content/long-term-operations-handler/services/long-term-operations-handler.service';
import { generateFormData } from 'src/app/core/defaults/form-data-generator';
import { SnackBarHandlerStatusService } from 'src/app/shared/services/snackbar/snack-bar-handler-status.service';
import { UploadFilesService } from 'src/app/shared/services/upload-files.service';
import { finalize, tap } from 'rxjs/operators';
import { ApiNoteFilesService } from '../../api/api-editor-files.service';
import { ApiPhotosService } from '../../api/api-photos.service';
import { Photo, PhotosCollection } from '../../entities/contents/photos-collection';
import { FileNoteTypes } from '../../entities/files/file-note-types.enum';
import { ContentEditorContentsService } from '../../ui-services/contents/content-editor-contents.service';
import { ContentEditorFilesBase } from './content-editor-files-base';
import { SignalRService } from 'src/app/core/signal-r.service';
import { ItemToCollectionUploaded } from '../../store/editor-actions';

@Injectable()
export class ContentEditorPhotosCollectionService extends ContentEditorFilesBase {
  constructor(
    store: Store,
    snackBarStatusTranslateService: SnackBarHandlerStatusService,
    uploadFilesService: UploadFilesService,
    longTermOperationsHandler: LongTermOperationsHandlerService,
    private apiPhotos: ApiPhotosService,
    contentEditorContentsService: ContentEditorContentsService,
    private apiFiles: ApiNoteFilesService,
    private signalR: SignalRService,
  ) {
    super(
      store,
      snackBarStatusTranslateService,
      uploadFilesService,
      longTermOperationsHandler,
      contentEditorContentsService,
    );
  }

  async transformToPhotosCollection(
    noteId: string,
    contentId: string,
    files: File[],
  ): Promise<string> {
    const isCan = await this.uploadFilesService.isCanUserUploadFiles(files);
    if (!isCan) {
      return;
    }
    const collectionResult = await this.apiPhotos.transformTo(noteId, contentId, this.signalR.connectionIdOrError).toPromise();
    if (collectionResult.success) {
      collectionResult.data.isLoading = true; // TODO TRY CATCH
      this.transformContentToOrWarning(collectionResult, contentId);
      await this.uploadPhotoToCollectionHandler(collectionResult.data.id, files, noteId);
      collectionResult.data.isLoading = false;
      return collectionResult.data.id;
    }
    return null;
  }

  uploadPhotoToCollectionHandler = async (contentId: string, files: File[], noteId: string) => {
    let collection = this.contentsService.getContentById<PhotosCollection>(contentId);
    collection.isLoading = true;

    const uploadsRequests = files.map((file) => {
      const formData = generateFormData(file);
      const operation = this.longTermOperationsHandler.addNewUploadToNoteOperation(
        'uploader.uploadingPhotosNoteLong',
        'uploader.uploading',
        'uploader.uploadingPhotosNote',
      );
      return this.apiFiles.uploadFilesToNote(formData, noteId, FileNoteTypes.Photo).pipe(
        tap((e) => {
          this.afterUploadFilesToCollectionSingle(e);
          if (!e.success) {
            return;
          }
          const photos = this.mapFilesSingle(e);
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
          collection = this.contentsService.getContentById<PhotosCollection>(contentId);
          collection.addItemsToCollection(photosMapped, collection.version, collection.updatedAt);
          e.data.forEach(x => this.store.dispatch(new ItemToCollectionUploaded(x.id, collection.id, noteId)));
        }),
        finalize(() => this.longTermOperationsHandler.finalize(operation))
      );
    });

    await this.uploadFilesParallel(uploadsRequests);
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
