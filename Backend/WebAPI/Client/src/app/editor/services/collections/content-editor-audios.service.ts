import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { LongTermOperationsHandlerService } from 'src/app/content/long-term-operations-handler/services/long-term-operations-handler.service';
import { generateFormData } from 'src/app/core/defaults/form-data-generator';
import { SnackBarHandlerStatusService } from 'src/app/shared/services/snackbar/snack-bar-handler-status.service';
import { UploadFilesService } from 'src/app/shared/services/upload-files.service';
import { finalize, tap } from 'rxjs/operators';
import { ApiAudiosService } from '../../api/api-audios.service';
import { ContentEditorFilesBase } from './content-editor-files-base';
import { ContentEditorContentsService } from '../../ui-services/contents/content-editor-contents.service';
import { ApiNoteFilesService } from '../../api/api-editor-files.service';
import { AudioModel, AudiosCollection } from '../../entities/contents/audios-collection';
import { FileNoteTypes } from '../../entities/files/file-note-types.enum';
import { SignalRService } from 'src/app/core/signal-r.service';
import { ItemToCollectionUploaded } from '../../store/editor-actions';

@Injectable()
export class ContentEditorAudiosCollectionService extends ContentEditorFilesBase {
  constructor(
    store: Store,
    snackBarStatusTranslateService: SnackBarHandlerStatusService,
    uploadFilesService: UploadFilesService,
    longTermOperationsHandler: LongTermOperationsHandlerService,
    private apiAudiosCollection: ApiAudiosService,
    contentEditorContentsService: ContentEditorContentsService,
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

  async transformToAudiosCollection(
    noteId: string,
    contentId: string,
    files: File[],
  ): Promise<string> {
    const isCan = await this.uploadFilesService.isCanUserUploadFiles(files);
    if (!isCan) {
      return;
    }
    const collectionResult = await this.apiAudiosCollection
      .transformTo(noteId, contentId, this.signalR.connectionIdOrError)
      .toPromise();
    if (collectionResult.success) {
      collectionResult.data.isLoading = true; // TODO TRY CATCH
      this.transformContentToOrWarning(collectionResult, contentId);
      await this.uploadAudioToCollectionHandler(collectionResult.data.id, files, noteId);
      collectionResult.data.isLoading = false;
      return collectionResult.data.id;
    }
    return null;
  }

  uploadAudioToCollectionHandler = async (contentId: string, files: File[], noteId: string) => {
    let collection = this.contentsService.getContentById<AudiosCollection>(contentId);
    collection.isLoading = true;

    const uploadsRequests = files.map((file) => {
      const formData = generateFormData(file);
      const operation = this.longTermOperationsHandler.addNewUploadToNoteOperation(
        'uploader.uploadingAudiosNoteLong',
        'uploader.uploading',
        'uploader.uploadingAudiosNote',
      );
      return this.apiFiles.uploadFilesToNote(formData, noteId, FileNoteTypes.Audio).pipe(
        tap((e) => {
          this.afterUploadFilesToCollectionSingle(e);
          if(!e.success) {
            return;
          }
          const audios = this.mapFilesSingle(e);
          const audiosMapped = audios.map(
            (x) =>
              new AudioModel({
                ...x,
                fileId: x.id,
                uploadAt: x.createdAt,
                audioPath: x.fromDefaultToSmall,
              }),
          );
          collection = this.contentsService.getContentById<AudiosCollection>(contentId);
          collection.addItemsToCollection(audiosMapped, collection.version, collection.updatedAt);
          e.data.forEach(x => this.store.dispatch(new ItemToCollectionUploaded(x.id, collection.id, noteId)));
        }),
        finalize(() => this.longTermOperationsHandler.finalize(operation))
      );
    });


    await this.uploadFilesParallel(uploadsRequests);
    collection.isLoading = false;
  };

  deleteAudioHandler(audioId: string, content: AudiosCollection) {
    if (content.items.length === 1) {
      this.deleteHandler(content.id);
    } else {
      // eslint-disable-next-line no-param-reassign
      content.items = content.items.filter((x) => x.fileId !== audioId);
    }
  }
}
