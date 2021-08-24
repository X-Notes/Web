import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { forkJoin } from 'rxjs';
import { LongTermOperationsHandlerService } from 'src/app/content/long-term-operations-handler/services/long-term-operations-handler.service';
import { byteToMB } from 'src/app/core/defaults/byte-convert';
import { maxRequestFileSize } from 'src/app/core/defaults/constraints';
import { generateFormData, nameForUploadAudios } from 'src/app/core/defaults/form-data-generator';
import { LoadUsedDiskSpace } from 'src/app/core/stateUser/user-action';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { SnackBarFileProcessHandlerService } from 'src/app/shared/services/snackbar/snack-bar-file-process-handler.service';
import { SnackBarHandlerStatusService } from 'src/app/shared/services/snackbar/snack-bar-handler-status.service';
import { UploadFilesService } from 'src/app/shared/services/upload-files.service';
import { AudiosCollection } from '../../../models/content-model.model';
import { RemoveAudioFromPlaylist } from '../../../models/remove-audio-from-playlist.model';
import { UploadFileToEntity } from '../../models/upload-files-to-entity';
import { ApiPlaylistService } from '../../services/api-playlist.service';
import { ContentEditorBase } from '../content-editor-base';
import { ContentEditorContentsService } from '../content-editor-contents.service';

@Injectable({
  providedIn: 'root'
})
export class ContentEditorAudiosCollectionService extends ContentEditorBase {

  constructor(
    store: Store, 
    snackBarStatusTranslateService: SnackBarHandlerStatusService,
    uploadFilesService: UploadFilesService,
    longTermOperationsHandler: LongTermOperationsHandlerService,
    snackBarFileProcessingHandler: SnackBarFileProcessHandlerService,
    private apiAudiosCollection: ApiPlaylistService,
    contentEditorContentsService: ContentEditorContentsService) {

    super(store, snackBarStatusTranslateService, 
          uploadFilesService, longTermOperationsHandler, snackBarFileProcessingHandler, contentEditorContentsService);

  }

  async transformToAudiosCollection(noteId: string, contentId: string, files: File[]){
    const newAlbumResult = await this.apiAudiosCollection.transformToPlaylist(noteId, contentId).toPromise();
    if(newAlbumResult.success){
      const index = this.getIndexOrError(contentId);
      this.transformContentTo(newAlbumResult, index);
      await this.uploadAudiosToCollectionHandler({contentId: newAlbumResult.data.id, files }, noteId);
    }
  }

  uploadAudiosToCollectionHandler = async ($event: UploadFileToEntity, noteId: string) => {

    const isCan = await this.uploadFilesService.isCanUserUploadFiles($event.files)
    if(!isCan){
      return;
    }

    const operation = this.longTermOperationsHandler.getNewUploadToNoteOperation();

    var uploadsRequests = $event.files.map(file => {
      const formData = generateFormData([file], nameForUploadAudios);
      const mini = this.longTermOperationsHandler.getOperationDetailMiniUploadToNoteOperation(operation);
      return this.apiAudiosCollection.uploadAudiosToPlaylist(formData, noteId, $event.contentId)
                .pipe(x => this.snackBarFileProcessingHandler.trackFileUploadProcess(x, mini));
    });

    let results = await forkJoin(uploadsRequests).toPromise();
    let audios = results.map(x => x.eventBody).filter(x => x.success).map(x => x.data).flat(); 
    
    const index = this.getIndexOrError($event.contentId);

    const prevDocuments = (this.contents[index] as AudiosCollection).audios;
    const collection: AudiosCollection = { ...(this.contents[index] as AudiosCollection), audios: [...prevDocuments, ...audios] };
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

  async removeAudioFromPlaylistHandler(event: RemoveAudioFromPlaylist, noteId: string) {

    const resp = await this.apiAudiosCollection
      .removeAudioFromPlaylist(noteId, event.contentId, event.audioId)
      .toPromise();

    if (resp.success) {
      const index = this.contents.findIndex((x) => x.id === event.contentId);
      const { audios } = this.contents[index] as AudiosCollection;
      if (audios.length === 1) {
        this.removeItemFromContents(event.contentId);
      } else {
        const newPlaylist: AudiosCollection = {
          ...(this.contents[index] as AudiosCollection),
          audios: audios.filter((x) => x.fileId !== event.audioId),
        };
        this.contents[index] = newPlaylist;
      }
      this.store.dispatch(LoadUsedDiskSpace);
    }
  }

  async changePlaylistName(contentId: string, noteId: string) {
    // TODO
    const name = 'any name';
    const resp = await this.apiAudiosCollection.changePlaylistName(noteId, contentId, name).toPromise();
    if (resp.success) {
      const index = this.contents.findIndex((x) => x.id === contentId);
      (this.contents[index] as AudiosCollection).name = name;
    }
  }
  
  removeAudiosCollectionHandler = async (contentId: string, noteId: string) => {
    const resp = await this.apiAudiosCollection.removePlaylist(noteId, contentId).toPromise();
    if (resp.success) {
      this.removeItemFromContents(contentId);
      this.store.dispatch(LoadUsedDiskSpace);
    }
  };

}
