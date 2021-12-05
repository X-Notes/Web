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
import { OperationResult } from 'src/app/shared/models/operation-result.model';
import { LoadUsedDiskSpace } from 'src/app/core/stateUser/user-action';
import { VideoModel, VideosCollection } from '../../../models/content-model.model';
import { UploadFileToEntity } from '../../models/upload-files-to-entity';
import { ApiVideosService } from '../../services/api-videos.service';
import { ContentEditorFilesBase } from './content-editor-files-base';
import { ContentEditorContentsService } from '../content-editor-contents.service';
import { FileNoteTypes } from '../../models/file-note-types.enum';
import { ApiNoteFilesService } from '../../services/api-note-files.service';

@Injectable()
export class ContentEditorVideosCollectionService extends ContentEditorFilesBase {
  constructor(
    store: Store,
    snackBarStatusTranslateService: SnackBarHandlerStatusService,
    uploadFilesService: UploadFilesService,
    longTermOperationsHandler: LongTermOperationsHandlerService,
    snackBarFileProcessingHandler: SnackBarFileProcessHandlerService,
    contentEditorContentsService: ContentEditorContentsService,
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
    const collectionResult = await this.apiVideos.transformToVideos(noteId, contentId).toPromise();
    if (collectionResult.success) {
      collectionResult.data.isLoading = true;
      collectionResult.data.videos = collectionResult.data.videos
        ? collectionResult.data.videos
        : [];
      this.transformContentToOrWarning(collectionResult, contentId);
      await this.uploadVideosToCollectionHandler(
        { contentId: collectionResult.data.id, files },
        noteId,
      );
      collectionResult.data.isLoading = false;
    }
  }

  insertNewContent(contentId: string, isFocusToNext: boolean) {
    let index = this.contentsService.getIndexOrErrorById(contentId);
    if (isFocusToNext) {
      index += 1;
    }
    const nContent = VideosCollection.getNew();
    this.contentsService.insertInto(nContent, index);
    return { index, content: nContent };
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
      const formData = generateFormData([file]);
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
      (x) => new VideoModel(x.name, x.pathNonPhotoContent, x.id, x.authorId, x.createdAt),
    );
    const prevCollection = this.contentsService.getContentById<VideosCollection>($event.contentId);
    const prev = prevCollection.videos ?? [];

    const newCollection = new VideosCollection(prevCollection);
    newCollection.videos = [...prev, ...videosMapped];

    this.contentsService.setSafe(newCollection, $event.contentId);

    this.afterUploadFilesToCollection(results);
  };

  deleteContentHandler = async (
    contentId: string,
    noteId: string,
  ): Promise<OperationResult<any>> => {
    const resp = await this.apiVideos.removeCollection(noteId, contentId).toPromise();
    if (resp.success) {
      this.deleteHandler(contentId);
    }
    return resp;
  };

  async deleteVideoHandler(videoId: string, contentId: string, noteId: string) {
    const resp = await this.apiVideos
      .removeVideoFromCollection(noteId, contentId, videoId)
      .toPromise();

    if (resp.success) {
      const prevCollection = this.contentsService.getContentById<VideosCollection>(contentId);
      if (prevCollection.videos.length === 1) {
        this.deleteHandler(contentId);
      } else {
        const newCollection = prevCollection.copy();
        newCollection.videos = newCollection.videos.filter((x) => x.fileId !== videoId);
        this.contentsService.setSafe(newCollection, contentId);
      }
      this.store.dispatch(LoadUsedDiskSpace);
    }
  }

  async changeVideosCollectionName(contentId: string, noteId: string, name: string): Promise<void> {
    const resp = await this.apiVideos
      .updateVideosCollectionInfo(noteId, contentId, name)
      .toPromise();
    if (resp.success) {
      const collection = this.contentsService.getContentById<VideosCollection>(contentId);
      collection.name = name;
      this.contentsService.setSafe(collection, collection.id);
    }
  }
}
