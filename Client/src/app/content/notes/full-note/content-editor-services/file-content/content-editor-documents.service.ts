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
import { DocumentModel, DocumentsCollection } from '../../../models/content-model.model';
import { UploadFileToEntity } from '../../models/upload-files-to-entity';
import { ApiDocumentsService } from '../../services/api-documents.service';
import { ContentEditorFilesBase } from './content-editor-files-base';
import { ContentEditorContentsService } from '../content-editor-contents.service';
import { ApiNoteFilesService } from '../../services/api-note-files.service';
import { FileNoteTypes } from '../../models/file-note-types.enum';

@Injectable()
export class ContentEditorDocumentsCollectionService extends ContentEditorFilesBase {
  constructor(
    store: Store,
    snackBarStatusTranslateService: SnackBarHandlerStatusService,
    uploadFilesService: UploadFilesService,
    longTermOperationsHandler: LongTermOperationsHandlerService,
    snackBarFileProcessingHandler: SnackBarFileProcessHandlerService,
    contentEditorContentsService: ContentEditorContentsService,
    private apiDocuments: ApiDocumentsService,
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

  async transformToDocumentsCollection(noteId: string, contentId: string, files: File[]) {
    const collectionResult = await this.apiDocuments
      .transformToDocuments(noteId, contentId)
      .toPromise();
    if (collectionResult.success) {
      collectionResult.data.isLoading = true; // TODO TRY CATCH
      collectionResult.data.documents = collectionResult.data.documents
        ? collectionResult.data.documents
        : [];
      this.transformContentToOrWarning(collectionResult, contentId);
      await this.uploadDocumentsToCollectionHandler(
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
    const nContent = DocumentsCollection.getNew();
    this.contentsService.insertInto(nContent, index);
    return { index, content: nContent };
  }

  uploadDocumentsToCollectionHandler = async ($event: UploadFileToEntity, noteId: string) => {
    const isCan = await this.uploadFilesService.isCanUserUploadFiles($event.files);
    if (!isCan) {
      return;
    }

    const operation = this.longTermOperationsHandler.addNewUploadToNoteOperation(
      'uploader.uploadingDocumentsNoteLong',
      'uploader.uploading',
      'uploader.uploadingDocumentsNote',
    );

    const uploadsRequests = $event.files.map((file) => {
      const formData = generateFormData([file]);
      const mini = this.longTermOperationsHandler.getNewMini(
        operation,
        LongTermsIcons.Document,
        file.name,
      );
      return this.apiFiles.uploadFilesToNote(formData, noteId, FileNoteTypes.Document).pipe(
        finalize(() => this.longTermOperationsHandler.finalize(operation, mini)),
        takeUntil(mini.obs),
        (x) => this.snackBarFileProcessingHandler.trackProcess(x, mini),
      );
    });

    const results = await forkJoin(uploadsRequests).toPromise();
    const documents = results
      .map((x) => x.eventBody)
      .filter((x) => x?.success)
      .map((x) => x?.data)
      .flat();

    if (!documents || documents.length === 0) {
      return;
    }

    const documentsMapped = documents.map(
      (x) => new DocumentModel(x.name, x.pathNonPhotoContent, x.id, x.authorId, x.createdAt),
    );
    const prevCollection = this.contentsService.getContentById<DocumentsCollection>(
      $event.contentId,
    );
    const prev = prevCollection.documents ?? [];

    const newCollection = new DocumentsCollection(prevCollection);
    newCollection.documents = [...prev, ...documentsMapped];

    this.contentsService.setSafe(newCollection, $event.contentId);

    this.afterUploadFilesToCollection(results);
  };

  deleteContentHandler = async (
    contentId: string,
    noteId: string,
  ): Promise<OperationResult<any>> => {
    const resp = await this.apiDocuments.removeDocumentFromNote(noteId, contentId).toPromise();
    if (resp.success) {
      this.deleteHandler(contentId);
    }
    return resp;
  };

  // eslint-disable-next-line class-methods-use-this
  deleteDocumentHandler(documentId: string, contentId: string, noteId: string) {
    // TODO
  }
}
