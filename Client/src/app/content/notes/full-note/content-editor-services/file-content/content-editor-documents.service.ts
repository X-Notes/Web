import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LongTermOperationsHandlerService } from 'src/app/content/long-term-operations-handler/services/long-term-operations-handler.service';
import { byteToMB } from 'src/app/core/defaults/byte-convert';
import { maxRequestFileSize } from 'src/app/core/defaults/constraints';
import { generateFormData, nameForUploadDocuments } from 'src/app/core/defaults/form-data-generator';
import { LoadUsedDiskSpace } from 'src/app/core/stateUser/user-action';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { SnackBarFileProcessHandlerService } from 'src/app/shared/services/snackbar/snack-bar-file-process-handler.service';
import { SnackBarHandlerStatusService } from 'src/app/shared/services/snackbar/snack-bar-handler-status.service';
import { UploadFilesService } from 'src/app/shared/services/upload-files.service';
import { DocumentsCollection } from '../../../models/content-model.model';
import { UploadFileToEntity } from '../../models/upload-files-to-entity';
import { ApiDocumentService } from '../../services/api-document.service';
import { ContentEditorBase } from '../content-editor-base';
import { ContentEditorContentsService } from '../content-editor-contents.service';

@Injectable({
  providedIn: 'root'
})
export class ContentEditorDocumentsCollectionService extends ContentEditorBase  {

  constructor(
    store: Store, 
    snackBarStatusTranslateService: SnackBarHandlerStatusService,
    uploadFilesService: UploadFilesService,
    longTermOperationsHandler: LongTermOperationsHandlerService,
    snackBarFileProcessingHandler: SnackBarFileProcessHandlerService,
    contentEditorContentsService: ContentEditorContentsService,
    private apiDocuments: ApiDocumentService) {
      super(store, snackBarStatusTranslateService, 
        uploadFilesService, longTermOperationsHandler, snackBarFileProcessingHandler, contentEditorContentsService);
  }

  async transformToDocuments(noteId: string, contentId: string, files: File[]) {
    const result = await this.apiDocuments.transformToDocuments(noteId, contentId).toPromise();
    if(result.success){
      const index = this.getIndexOrError(contentId);
      this.transformContentTo(result, index);
      await this.uploadDocumentsToCollectionHandler({contentId: result.data.id, files }, noteId);
    }
  }

  uploadDocumentsToCollectionHandler = async ($event: UploadFileToEntity, noteId: string) => {

    const isCan = await this.uploadFilesService.isCanUserUploadFiles($event.files)
    if(!isCan){
      return;
    }

    const operation = this.longTermOperationsHandler.getNewUploadToNoteOperation();

    var uploadsRequests = $event.files.map(file => {
      const formData = generateFormData([file], nameForUploadDocuments);
      const mini = this.longTermOperationsHandler.getOperationDetailMiniUploadToNoteOperation(operation);
      return this.apiDocuments.uploadDocumentsToCollection(formData, noteId, $event.contentId)
                          .pipe(x => this.snackBarFileProcessingHandler.trackFileUploadProcess(x, mini));
    });

    let results = await forkJoin(uploadsRequests).toPromise();
    let documents = results.map(x => x.eventBody).filter(x => x.success).map(x => x.data).flat(); 
    
    const index = this.getIndexOrError($event.contentId);
    const prevDocument = (this.contents[index] as DocumentsCollection).documents;
    const collection: DocumentsCollection = { ...(this.contents[index] as DocumentsCollection), documents: [...prevDocument, ...documents] };
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

  removeDocumentHandler = async (contentId: string, noteId: string) => {
    const resp = await this.apiDocuments.removeDocumentFromNote(noteId, contentId).toPromise();
    if (resp.success) {
      this.removeItemFromContents(contentId);
      this.store.dispatch(LoadUsedDiskSpace);
    }
  };

}
