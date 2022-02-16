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
import { UploadFileToEntity } from '../../models/upload-files-to-entity';
import { ApiAudiosService } from '../../services/api-audios.service';
import { ContentEditorFilesBase } from './content-editor-files-base';
import { ContentEditorContentsService } from '../content-editor-contents.service';
import { ApiNoteFilesService } from '../../services/api-note-files.service';
import { FileNoteTypes } from '../../models/file-note-types.enum';
import { AudioModel, AudiosCollection } from '../../../models/editor-models/audios-collection';

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

  async transformToAudiosCollection(noteId: string, contentId: string, files: File[]) {
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
    }
  }

  uploadAudiosToCollectionHandler = async ($event: UploadFileToEntity, noteId: string) => {
    const isCan = await this.uploadFilesService.isCanUserUploadFiles($event.files);
    if (!isCan) {
      return;
    }

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

    const results = await forkJoin(uploadsRequests).toPromise();
    const audios = results
      .map((x) => x.eventBody)
      .filter((x) => x?.success)
      .map((x) => x?.data)
      .flat();

    if (!audios || audios.length === 0) {
      return;
    }

    const audiosMapped = audios.map(
      (x) =>
        new AudioModel(x.name, x.pathNonPhotoContent, x.id, x.authorId, x.createdAt, null, null),
    );
    const prevCollection = this.contentsService.getContentById<AudiosCollection>($event.contentId);
    const prev = prevCollection.items ?? [];

    const newCollection = new AudiosCollection(prevCollection, prevCollection.items);
    newCollection.items = [...prev, ...audiosMapped];

    this.contentsService.setSafe(newCollection, $event.contentId);

    this.afterUploadFilesToCollection(results);
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
