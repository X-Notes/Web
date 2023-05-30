import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { LongTermOperationsHandlerService } from 'src/app/content/long-term-operations-handler/services/long-term-operations-handler.service';
import { generateFormData } from 'src/app/core/defaults/form-data-generator';
import { SnackBarFileProcessHandlerService } from 'src/app/shared/services/snackbar/snack-bar-file-process-handler.service';
import { SnackBarHandlerStatusService } from 'src/app/shared/services/snackbar/snack-bar-handler-status.service';
import { UploadFilesService } from 'src/app/shared/services/upload-files.service';
import { finalize, takeUntil } from 'rxjs/operators';
import { LongTermsIcons } from 'src/app/content/long-term-operations-handler/models/long-terms.icons';
import { UploadFileToEntity } from '../../entities-ui/upload-files-to-entity';
import { ApiAudiosService } from '../../api/api-audios.service';
import { ContentEditorFilesBase } from './content-editor-files-base';
import { ContentEditorContentsService } from '../../ui-services/contents/content-editor-contents.service';
import { ApiNoteFilesService } from '../../api/api-note-files.service';
import { AudioModel, AudiosCollection } from '../../entities/contents/audios-collection';
import { FileNoteTypes } from '../../entities/files/file-note-types.enum';

@Injectable()
export class ContentEditorAudiosCollectionService extends ContentEditorFilesBase {
  constructor(
    store: Store,
    snackBarStatusTranslateService: SnackBarHandlerStatusService,
    uploadFilesService: UploadFilesService,
    longTermOperationsHandler: LongTermOperationsHandlerService,
    snackBarFileProcessingHandler: SnackBarFileProcessHandlerService,
    private apiAudiosCollection: ApiAudiosService,
    contentEditorContentsService: ContentEditorContentsService,
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
      .transformTo(noteId, contentId)
      .toPromise();
    if (collectionResult.success) {
      collectionResult.data.isLoading = true; // TODO TRY CATCH
      this.transformContentToOrWarning(collectionResult, contentId);
      await this.uploadAudiosToCollectionHandler(
        { contentId: collectionResult.data.id, files },
        noteId,
      );
      collectionResult.data.isLoading = false;
      return collectionResult.data.id;
    }
    return null;
  }

  uploadAudiosToCollectionHandler = async (
    $event: UploadFileToEntity,
    noteId: string,
  ): Promise<AudioModel[]> => {
    const operation = this.longTermOperationsHandler.addNewUploadToNoteOperation(
      'uploader.uploadingAudiosNoteLong',
      'uploader.uploading',
      'uploader.uploadingAudiosNote',
    );

    const uploadsRequests = $event.files.map((file) => {
      const formData = generateFormData(file);
      const mini = this.longTermOperationsHandler.getNewMini(
        operation,
        LongTermsIcons.Audio,
        file.name,
      );

      return this.apiFiles.uploadFilesToNote(formData, noteId, FileNoteTypes.Audio).pipe(
        finalize(() => this.longTermOperationsHandler.finalize(operation, mini)),
        takeUntil(mini.obs),
        (x) => this.snackBarFileProcessingHandler.trackProcess(x, mini),
      );
    });

    let collection = this.contentsService.getContentById<AudiosCollection>($event.contentId);
    collection.isLoading = true;

    const results = await this.uploadFilesParallel(uploadsRequests);
    if (!results) {
      collection.isLoading = false;
      return;
    }

    const audios = this.mapFiles(results);

    this.afterUploadFilesToCollection(results);
    if (!audios || audios.length === 0) {
      collection.isLoading = false;
      return;
    }

    const audiosMapped = audios.map(
      (x) =>
        new AudioModel({
          ...x,
          fileId: x.id,
          uploadAt: x.createdAt,
          audioPath: x.fromDefaultToSmall,
        }),
    );

    collection = this.contentsService.getContentById<AudiosCollection>($event.contentId);
    collection.addItemsToCollection(audiosMapped, collection.version, collection.updatedAt);
    collection.isLoading = false;

    return audiosMapped;
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
