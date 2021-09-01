import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { forkJoin, Subject } from 'rxjs';
import { LongTermOperationsHandlerService } from 'src/app/content/long-term-operations-handler/services/long-term-operations-handler.service';
import { generateFormData, nameForUploadAudios } from 'src/app/core/defaults/form-data-generator';
import { LoadUsedDiskSpace } from 'src/app/core/stateUser/user-action';
import { SnackBarFileProcessHandlerService } from 'src/app/shared/services/snackbar/snack-bar-file-process-handler.service';
import { SnackBarHandlerStatusService } from 'src/app/shared/services/snackbar/snack-bar-handler-status.service';
import { UploadFilesService } from 'src/app/shared/services/upload-files.service';
import { finalize, takeUntil } from 'rxjs/operators';
import { LongTermsIcons } from 'src/app/content/long-term-operations-handler/models/long-terms.icons';
import { AudiosCollection } from '../../../models/content-model.model';
import { RemoveAudioFromPlaylist } from '../../../models/remove-audio-from-playlist.model';
import { UploadFileToEntity } from '../../models/upload-files-to-entity';
import { ApiPlaylistService } from '../../services/api-playlist.service';
import { ContentEditorFilesBase } from './content-editor-files-base';
import { ContentEditorContentsService } from '../content-editor-contents.service';

@Injectable({
  providedIn: 'root',
})
export class ContentEditorAudiosCollectionService extends ContentEditorFilesBase {
  constructor(
    store: Store,
    snackBarStatusTranslateService: SnackBarHandlerStatusService,
    uploadFilesService: UploadFilesService,
    longTermOperationsHandler: LongTermOperationsHandlerService,
    snackBarFileProcessingHandler: SnackBarFileProcessHandlerService,
    private apiAudiosCollection: ApiPlaylistService,
    contentEditorContentsService: ContentEditorContentsService,
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
    const newAlbumResult = await this.apiAudiosCollection
      .transformToPlaylist(noteId, contentId)
      .toPromise();
    if (newAlbumResult.success) {
      this.transformContentTo(newAlbumResult, contentId);
      await this.uploadAudiosToCollectionHandler(
        { contentId: newAlbumResult.data.id, files },
        noteId,
      );
    }
  }

  uploadAudiosToCollectionHandler = async ($event: UploadFileToEntity, noteId: string) => {
    const isCan = await this.uploadFilesService.isCanUserUploadFiles($event.files);
    if (!isCan) {
      return;
    }

    const operation = await this.longTermOperationsHandler.addNewUploadToNoteOperation(
      'uploader.uploadingAudiosNoteLong',
      'uploader.uploading',
      'uploader.uploadingAudiosNote',
    );

    const uploadsRequests = $event.files.map((file) => {
      const formData = generateFormData([file], nameForUploadAudios);
      const cancellationSubject = new Subject<any>();
      const mini = this.longTermOperationsHandler.addOperationDetailMiniUploadToNoteOperation(
        operation,
        cancellationSubject,
        LongTermsIcons.Audio,
        file.name,
      );
      return this.apiAudiosCollection
        .uploadAudiosToPlaylist(formData, noteId, $event.contentId)
        .pipe(
          finalize(() => this.longTermOperationsHandler.finalize(operation, mini)),
          takeUntil(cancellationSubject),
          (x) => this.snackBarFileProcessingHandler.trackFileUploadProcess(x, mini),
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

    const collection = this.contentsService.getContentById<AudiosCollection>($event.contentId);
    const prev = collection.audios ?? [];
    const newCollection: AudiosCollection = { ...collection, audios: [...prev, ...audios] };

    this.contentsService.setSafe(newCollection, $event.contentId);

    this.afterUploadFilesToCollection(results);
  };

  async removeAudioFromPlaylistHandler(event: RemoveAudioFromPlaylist, noteId: string) {
    const resp = await this.apiAudiosCollection
      .removeAudioFromPlaylist(noteId, event.contentId, event.audioId)
      .toPromise();

    if (resp.success) {
      const collection = this.contentsService.getContentById<AudiosCollection>(event.contentId);
      if (collection.audios.length === 1) {
        this.removeHandler(event.contentId);
      } else {
        const newCollection: AudiosCollection = {
          ...collection,
          audios: collection.audios.filter((x) => x.fileId !== event.audioId),
        };
        this.contentsService.setSafe(newCollection, event.contentId);
      }
      this.store.dispatch(LoadUsedDiskSpace);
    }
  }

  async changePlaylistName(contentId: string, noteId: string) {
    // TODO
    const name = 'any name';
    const resp = await this.apiAudiosCollection
      .changePlaylistName(noteId, contentId, name)
      .toPromise();
    if (resp.success) {
      const collection = this.contentsService.getContentById<AudiosCollection>(contentId);
      collection.name = name;
    }
  }

  removeAudiosCollectionHandler = async (contentId: string, noteId: string) => {
    const resp = await this.apiAudiosCollection.removePlaylist(noteId, contentId).toPromise();
    if (resp.success) {
      this.removeHandler(contentId);
    }
  };
}
