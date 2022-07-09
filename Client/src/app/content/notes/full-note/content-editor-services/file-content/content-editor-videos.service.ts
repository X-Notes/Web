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
import { ApiVideosService } from '../../services/api-videos.service';
import { ContentEditorFilesBase } from './content-editor-files-base';
import { ContentEditorContentsSynchronizeService } from '../content-editor-contents.service';
import { FileNoteTypes } from '../../models/file-note-types.enum';
import { ApiNoteFilesService } from '../../services/api-note-files.service';
import { VideoModel, VideosCollection } from '../../../models/editor-models/videos-collection';

@Injectable()
export class ContentEditorVideosCollectionService extends ContentEditorFilesBase {
  constructor(
    store: Store,
    snackBarStatusTranslateService: SnackBarHandlerStatusService,
    uploadFilesService: UploadFilesService,
    longTermOperationsHandler: LongTermOperationsHandlerService,
    snackBarFileProcessingHandler: SnackBarFileProcessHandlerService,
    contentEditorContentsService: ContentEditorContentsSynchronizeService,
    private apiVideos: ApiVideosService,
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

  async transformToVideosCollection(noteId: string, contentId: string, files: File[]) {
    const collectionResult = await this.apiVideos.transformTo(noteId, contentId).toPromise();
    if (collectionResult.success) {
      collectionResult.data.isLoading = true;
      this.transformContentToOrWarning(collectionResult, contentId);
      await this.uploadVideosToCollectionHandler(
        { contentId: collectionResult.data.id, files },
        noteId,
      );
      collectionResult.data.isLoading = false;
      return collectionResult.data.id;
    }
    return null;
  }

  uploadVideosToCollectionHandler = async ($event: UploadFileToEntity, noteId: string) => {
    const isCan = await this.uploadFilesService.isCanUserUploadFiles($event.files);
    if (!isCan) {
      return;
    }

    const operation = this.longTermOperationsHandler.addNewUploadToNoteOperation(
      'uploader.uploadingVideosNoteLong',
      'uploader.uploading',
      'uploader.uploadingVideosNote',
    );

    const uploadsRequests = $event.files.map((file) => {
      const formData = generateFormData(file);
      const mini = this.longTermOperationsHandler.getNewMini(
        operation,
        LongTermsIcons.Video,
        file.name,
      );

      return this.apiFiles.uploadFilesToNote(formData, noteId, FileNoteTypes.Video).pipe(
        finalize(() => this.longTermOperationsHandler.finalize(operation, mini)),
        takeUntil(mini.obs),
        (x) => this.snackBarFileProcessingHandler.trackProcess(x, mini),
      );
    });

    let collection = this.contentsService.getContentById<VideosCollection>($event.contentId);
    collection.isLoading = true;

    const results = await forkJoin(uploadsRequests).toPromise();
    const videos = results
      .map((x) => x.eventBody)
      .filter((x) => x?.success)
      .map((x) => x?.data)
      .flat();

    if (!videos || videos.length === 0) {
      return;
    }

    const videosMapped = videos.map(
      (x) =>
        new VideoModel({
          ...x,
          fileId: x.id,
          uploadAt: x.createdAt,
          videoPath: x.pathNonPhotoContent,
        }),
    );

    collection = this.contentsService.getContentById<VideosCollection>($event.contentId);
    collection.addItemsToCollection(videosMapped);
    this.afterUploadFilesToCollection(results);
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
