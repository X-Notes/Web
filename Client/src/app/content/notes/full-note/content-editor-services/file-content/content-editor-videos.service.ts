import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LongTermOperationsHandlerService } from 'src/app/content/long-term-operations-handler/services/long-term-operations-handler.service';
import { byteToMB } from 'src/app/core/defaults/byte-convert';
import { maxRequestFileSize } from 'src/app/core/defaults/constraints';
import { generateFormData, nameForUploadVideos } from 'src/app/core/defaults/form-data-generator';
import { LoadUsedDiskSpace } from 'src/app/core/stateUser/user-action';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { SnackBarFileProcessHandlerService } from 'src/app/shared/services/snackbar/snack-bar-file-process-handler.service';
import { SnackBarHandlerStatusService } from 'src/app/shared/services/snackbar/snack-bar-handler-status.service';
import { UploadFilesService } from 'src/app/shared/services/upload-files.service';
import { VideosCollection } from '../../../models/content-model.model';
import { UploadFileToEntity } from '../../models/upload-files-to-entity';
import { ApiVideoService } from '../../services/api-video.service';
import { ContentEditorBase } from '../content-editor-base';
import { ContentEditorContentsService } from '../content-editor-contents.service';

@Injectable({
  providedIn: 'root'
})
export class ContentEditorVideosCollectionService extends ContentEditorBase  {

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
      const index = this.getIndexOrError(contentId);
      this.transformContentTo(result, index);
      await this.uploadVideosToCollectionHandler({contentId: result.data.id, files }, noteId);
    }
  }

  uploadVideosToCollectionHandler = async ($event: UploadFileToEntity, noteId: string) => {

    const isCan = await this.uploadFilesService.isCanUserUploadFiles($event.files)
    if(!isCan){
      return;
    }

    const operation = this.longTermOperationsHandler.getNewUploadToNoteOperation();

    var uploadsRequests = $event.files.map(file => {
      const formData = generateFormData([file], nameForUploadVideos);
      const mini = this.longTermOperationsHandler.getOperationDetailMiniUploadToNoteOperation(operation);
      return this.apiVideos.uploadVideosToCollection(formData, noteId, $event.contentId)
                          .pipe(x => this.snackBarFileProcessingHandler.trackFileUploadProcess(x, mini));
    });

    let results = await forkJoin(uploadsRequests).toPromise();
    let videos = results.map(x => x.eventBody).filter(x => x.success).map(x => x.data).flat(); 
    
    const index = this.getIndexOrError($event.contentId);
    const prevVideos = (this.contents[index] as VideosCollection).videos;
    const collection: VideosCollection = { ...(this.contents[index] as VideosCollection), videos: [...prevVideos, ...videos] };
    this.setContentsItem(collection, index);

    this.store.dispatch(LoadUsedDiskSpace);

    const unsuccess = results.map(x => x.eventBody).filter(x => !x.success);
    if(unsuccess?.length > 0){
      const lname = this.store.selectSnapshot(UserStore.getUserLanguage);
      unsuccess.forEach(op => {
        this.snackBarStatusTranslateService.validateStatus(lname, op, byteToMB(maxRequestFileSize));
      });
    }
  };

  removeVideosHandler = async (contentId: string, noteId: string) => {
    const resp = await this.apiVideos.removeVideoFromNote(noteId, contentId).toPromise();
    if (resp.success) {
      this.removeItemFromContents(contentId);
      this.store.dispatch(LoadUsedDiskSpace);
    }
  };

}
