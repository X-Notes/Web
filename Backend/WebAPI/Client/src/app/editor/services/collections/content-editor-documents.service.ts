import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { LongTermOperationsHandlerService } from 'src/app/content/long-term-operations-handler/services/long-term-operations-handler.service';
import { generateFormData } from 'src/app/core/defaults/form-data-generator';
import { SnackBarHandlerStatusService } from 'src/app/shared/services/snackbar/snack-bar-handler-status.service';
import { UploadFilesService } from 'src/app/shared/services/upload-files.service';
import { finalize, tap } from 'rxjs/operators';
import { ApiDocumentsService } from '../../api/api-documents.service';
import { ApiNoteFilesService } from '../../api/api-editor-files.service';
import { FileNoteTypes } from '../../entities/files/file-note-types.enum';
import { ContentEditorContentsService } from '../../ui-services/contents/content-editor-contents.service';
import { ContentEditorFilesBase } from './content-editor-files-base';
import { DocumentModel, DocumentsCollection } from '../../entities/contents/documents-collection';
import { SignalRService } from 'src/app/core/signal-r.service';
import { ItemToCollectionUploaded } from '../../store/editor-actions';

@Injectable()
export class ContentEditorDocumentsCollectionService extends ContentEditorFilesBase {
  constructor(
    store: Store,
    snackBarStatusTranslateService: SnackBarHandlerStatusService,
    uploadFilesService: UploadFilesService,
    longTermOperationsHandler: LongTermOperationsHandlerService,
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
      await this.uploadDocumentToCollectionHandler(collectionResult.data.id, files, noteId);
      collectionResult.data.isLoading = false;
      return collectionResult.data.id;
    }
    return null;
  }

  uploadDocumentToCollectionHandler = async (contentId: string, files: File[], noteId: string) => {
    let collection = this.contentsService.getContentById<DocumentsCollection>(contentId);
    collection.isLoading = true;

    const uploadsRequests = files.map((file) => {
      const formData = generateFormData(file);
      const operation = this.longTermOperationsHandler.addNewUploadToNoteOperation(
        'uploader.uploadingDocumentsNoteLong',
        'uploader.uploading',
        'uploader.uploadingDocumentsNote',
      );
      return this.apiFiles.uploadFilesToNote(formData, noteId, FileNoteTypes.Document).pipe(
        tap((e) => {
          this.afterUploadFilesToCollectionSingle(e);
          if (!e.success) {
            return;
          }
          const documents = this.mapFilesSingle(e);
          const documentsMapped = documents.map(
            (x) =>
              new DocumentModel({
                ...x,
                fileId: x.id,
                uploadAt: x.createdAt,
                documentPath: x.fromDefaultToSmall,
              }),
          );
          collection = this.contentsService.getContentById<DocumentsCollection>(contentId);
          collection.addItemsToCollection(documentsMapped, collection.version, collection.updatedAt);
          e.data.forEach(x => this.store.dispatch(new ItemToCollectionUploaded(x.id, collection.id, noteId)));
        }),
        finalize(() => this.longTermOperationsHandler.finalize(operation))
      );
    });

    await this.uploadFilesParallel(uploadsRequests);
    collection.isLoading = false;
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
