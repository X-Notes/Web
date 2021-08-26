import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { forkJoin } from 'rxjs';
import { LongTermOperationsHandlerService } from 'src/app/content/long-term-operations-handler/services/long-term-operations-handler.service';
import { generateFormData, nameForUploadVideos } from 'src/app/core/defaults/form-data-generator';
import { SnackBarFileProcessHandlerService } from 'src/app/shared/services/snackbar/snack-bar-file-process-handler.service';
import { SnackBarHandlerStatusService } from 'src/app/shared/services/snackbar/snack-bar-handler-status.service';
import { UploadFilesService } from 'src/app/shared/services/upload-files.service';
import { VideosCollection } from '../../../models/content-model.model';
import { UploadFileToEntity } from '../../models/upload-files-to-entity';
import { ApiVideoService } from '../../services/api-video.service';
import { ContentEditorFilesBase } from './content-editor-files-base';
import { ContentEditorContentsService } from '../content-editor-contents.service';

@Injectable({
  providedIn: 'root'
})
export class ContentEditorVideosCollectionService extends ContentEditorFilesBase  {

  constructor(
    store: Store, 
    snackBarStatusTranslateService: SnackBarHandlerStatusService,
    uploadFilesService: UploadFilesService,
    longTermOperationsHandler: LongTermOperationsHandlerService,
    snackBarFileProcessingHandler: SnackBarFileProcessHandlerService,
    contentEditorContentsService: ContentEditorContentsService,
    private apiVideos: ApiVideoService) {
      super(store, snackBarStatusTranslateService, 
        uploadFilesService, longTermOperationsHandler, snackBarFileProcessingHandler, contentEditorContentsService);
  }

  async transformToVideos(noteId: string, contentId: string, files: File[]) {
    const result = await this.apiVideos.transformToVideos(noteId, contentId).toPromise();
    if(result.success){
      this.transformContentTo(result, contentId);
      await this.uploadVideosToCollectionHandler({contentId: result.data.id, files }, noteId);
    }
  }

  uploadVideosToCollectionHandler = async ($event: UploadFileToEntity, noteId: string) => {

    const isCan = await this.uploadFilesService.isCanUserUploadFiles($event.files)
    if(!isCan){
      return;
    }

    const operation = this.longTermOperationsHandler.getNewUploadToNoteOperation();

    const uploadsRequests = $event.files.map(file => {
      const formData = generateFormData([file], nameForUploadVideos);
      const mini = this.longTermOperationsHandler.getOperationDetailMiniUploadToNoteOperation(operation);
      return this.apiVideos.uploadVideosToCollection(formData, noteId, $event.contentId)
                          .pipe(x => this.snackBarFileProcessingHandler.trackFileUploadProcess(x, mini));
    });

    let results = await forkJoin(uploadsRequests).toPromise();
    let videos = results.map(x => x.eventBody).filter(x => x.success).map(x => x.data).flat(); 
    
    const prevCollection = this.contentsService.getContentById<VideosCollection>($event.contentId);
    const prev = prevCollection.videos ?? [];
    const collection: VideosCollection = { ...prevCollection, videos: [...prev, ...videos] };

    this.contentsService.setSafe(collection, $event.contentId);

    this.afterUploadFilesToCollection(results);
  };

  removeVideosHandler = async (contentId: string, noteId: string) => {
    const resp = await this.apiVideos.removeVideoFromNote(noteId, contentId).toPromise();
    if (resp.success) {
      this.removeHandler(contentId);
    }
  };

}
