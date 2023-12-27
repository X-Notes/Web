import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { LongTermOperationsHandlerService } from 'src/app/content/long-term-operations-handler/services/long-term-operations-handler.service';
import { generateFormData } from 'src/app/core/defaults/form-data-generator';
import { SnackBarHandlerStatusService } from 'src/app/shared/services/snackbar/snack-bar-handler-status.service';
import { UploadFilesService } from 'src/app/shared/services/upload-files.service';
import { finalize, tap } from 'rxjs/operators';
import { ApiNoteFilesService } from '../../api/api-editor-files.service';
import { ApiVideosService } from '../../api/api-videos.service';
import { VideoModel, VideosCollection } from '../../entities/contents/videos-collection';
import { FileNoteTypes } from '../../entities/files/file-note-types.enum';
import { ContentEditorContentsService } from '../../ui-services/contents/content-editor-contents.service';
import { ContentEditorFilesBase } from './content-editor-files-base';
import { SignalRService } from 'src/app/core/signal-r.service';
import { ItemToCollectionUploaded } from '../../store/editor-actions';

@Injectable()
export class ContentEditorVideosCollectionService extends ContentEditorFilesBase {
  constructor(
    store: Store,
    snackBarStatusTranslateService: SnackBarHandlerStatusService,
    uploadFilesService: UploadFilesService,
    longTermOperationsHandler: LongTermOperationsHandlerService,
    contentEditorContentsService: ContentEditorContentsService,
    private apiVideos: ApiVideosService,
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

  async transformToVideosCollection(noteId: string, contentId: string, files: File[]) {
    const isCan = await this.uploadFilesService.isCanUserUploadFiles(files);
    if (!isCan) {
      return;
    }
    const collectionResult = await this.apiVideos.transformTo(noteId, contentId, this.signalR.connectionIdOrError).toPromise();
    if (collectionResult.success) {
      collectionResult.data.isLoading = true;
      this.transformContentToOrWarning(collectionResult, contentId);
      await this.uploadVideoToCollectionHandler(collectionResult.data.id, files, noteId);
      collectionResult.data.isLoading = false;
      return collectionResult.data.id;
    }
    return null;
  }

  uploadVideoToCollectionHandler = async (contentId: string, files: File[], noteId: string) => {
    let collection = this.contentsService.getContentById<VideosCollection>(contentId);
    collection.isLoading = true;

    const uploadsRequests = files.map((file) => {
      const formData = generateFormData(file);
      const operation = this.longTermOperationsHandler.addNewUploadToNoteOperation(
        'uploader.uploadingVideosNoteLong',
        'uploader.uploading',
        'uploader.uploadingVideosNote',
      );
      return this.apiFiles.uploadFilesToNote(formData, noteId, FileNoteTypes.Video).pipe(
        tap((e) => {
          this.afterUploadFilesToCollectionSingle(e);
          if (!e.success) {
            return;
          }
          const photos = this.mapFilesSingle(e);
          const photosMapped = photos.map(
            (x) =>
              new VideoModel({
                ...x,
                fileId: x.id,
                uploadAt: x.createdAt,
                videoPath: x.fromDefaultToSmall,
              }),
          );
          collection = this.contentsService.getContentById<VideosCollection>(contentId);
          collection.addItemsToCollection(photosMapped, collection.version, collection.updatedAt);
          e.data.forEach(x => this.store.dispatch(new ItemToCollectionUploaded(x.id, collection.id, noteId)));
        }),
        finalize(() => this.longTermOperationsHandler.finalize(operation))
      );
    });

    await this.uploadFilesParallel(uploadsRequests);
    collection.isLoading = false;
  };

  deleteVideoHandler(videoId: string, content: VideosCollection) {
    if (content.items.length === 1) {
      this.deleteHandler(content.id);
    } else {
      // eslint-disable-next-line no-param-reassign
      content.items = content.items.filter((x) => x.fileId !== videoId);
    }
  }
}
