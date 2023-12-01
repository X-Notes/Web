import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { LongTermOperationsHandlerService } from 'src/app/content/long-term-operations-handler/services/long-term-operations-handler.service';
import { generateFormData } from 'src/app/core/defaults/form-data-generator';
import { SnackBarFileProcessHandlerService } from 'src/app/shared/services/snackbar/snack-bar-file-process-handler.service';
import { SnackBarHandlerStatusService } from 'src/app/shared/services/snackbar/snack-bar-handler-status.service';
import { UploadFilesService } from 'src/app/shared/services/upload-files.service';
import { finalize, takeUntil } from 'rxjs/operators';
import { LongTermsIcons } from 'src/app/content/long-term-operations-handler/models/long-terms.icons';
import { ApiDocumentsService } from '../../api/api-documents.service';
import { ApiNoteFilesService } from '../../api/api-editor-files.service';
import { UploadFileToEntity } from '../../entities-ui/upload-files-to-entity';
import { FileNoteTypes } from '../../entities/files/file-note-types.enum';
import { ContentEditorContentsService } from '../../ui-services/contents/content-editor-contents.service';
import { ContentEditorFilesBase } from './content-editor-files-base';
import { DocumentModel, DocumentsCollection } from '../../entities/contents/documents-collection';
import { SignalRService } from 'src/app/core/signal-r.service';

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
    private signalR: SignalRService,
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

  async transformToDocumentsCollection(
    noteId: string,
    contentId: string,
    files: File[],
  ): Promise<string> {
    const isCan = await this.uploadFilesService.isCanUserUploadFiles(files);
    if (!isCan) {
      return;
    }
    const collectionResult = await this.apiDocuments.transformTo(noteId, contentId, this.signalR.connectionIdOrError).toPromise();
    if (collectionResult.success) {
      collectionResult.data.isLoading = true; // TODO TRY CATCH
      this.transformContentToOrWarning(collectionResult, contentId);
      await this.uploadDocumentsToCollectionHandler(
        { contentId: collectionResult.data.id, files },
        noteId,
      );
      collectionResult.data.isLoading = false;
      return collectionResult.data.id;
    }
    return null;
  }

  uploadDocumentsToCollectionHandler = async (
    $event: UploadFileToEntity,
    noteId: string,
  ): Promise<DocumentModel[]> => {
    const operation = this.longTermOperationsHandler.addNewUploadToNoteOperation(
      'uploader.uploadingDocumentsNoteLong',
      'uploader.uploading',
      'uploader.uploadingDocumentsNote',
    );

    const uploadsRequests = $event.files.map((file) => {
      const formData = generateFormData(file);
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

    let collection = this.contentsService.getContentById<DocumentsCollection>($event.contentId);
    collection.isLoading = true;

    const results = await this.uploadFilesParallel(uploadsRequests);
    if (!results) {
      collection.isLoading = false;
      return;
    }

    const documents = this.mapFiles(results);

    this.afterUploadFilesToCollection(results);
    if (!documents || documents.length === 0) {
      collection.isLoading = false;
      return;
    }

    const documentsMapped = documents.map(
      (x) =>
        new DocumentModel({
          ...x,
          fileId: x.id,
          uploadAt: x.createdAt,
          documentPath: x.fromDefaultToSmall,
        }),
    );

    collection = this.contentsService.getContentById<DocumentsCollection>($event.contentId);
    collection.addItemsToCollection(documentsMapped, collection.version, collection.updatedAt);
    collection.isLoading = false;

    return documentsMapped;
  };

  deleteDocumentHandler(documentId: string, content: DocumentsCollection) {
    if (content.items.length === 1) {
      this.deleteHandler(content.id);
    } else {
      // eslint-disable-next-line no-param-reassign
      content.items = content.items.filter((x) => x.fileId !== documentId);
    }
  }
}
