import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as JSZip from 'jszip';
import { forkJoin, Observable } from 'rxjs';
import { finalize, map, takeUntil } from 'rxjs/operators';
import { saveAs } from 'file-saver';
import * as moment from 'moment';
import {
  FileProcessTracker,
  SnackBarFileProcessHandlerService,
} from 'src/app/shared/services/snackbar/snack-bar-file-process-handler.service';
import { LongTermOperationsHandlerService } from '../long-term-operations-handler/services/long-term-operations-handler.service';
import { LongTermsIcons } from '../long-term-operations-handler/models/long-terms.icons';
import {
  LongTermOperation,
  OperationDetailMini,
} from '../long-term-operations-handler/models/long-term-operation';
import { Photo, PhotosCollection } from './models/editor-models/photos-collection';
import { AudioModel, AudiosCollection } from './models/editor-models/audios-collection';
import { DocumentsCollection, DocumentModel } from './models/editor-models/documents-collection';
import { VideosCollection, VideoModel } from './models/editor-models/videos-collection';

@Injectable({
  providedIn: 'root',
})
export class ExportService {
  constructor(
    private httpClient: HttpClient,
    protected longTermOperationsHandler: LongTermOperationsHandlerService,
    protected snackBarFileProcessingHandler: SnackBarFileProcessHandlerService,
  ) {}

  zipFiles = async (tasks: Observable<{ blob: FileProcessTracker<Blob>; name: string }>[]) => {
    const resp = await forkJoin(tasks).toPromise();
    const zip = new JSZip();
    resp.forEach((x) => zip.file(x.name, x.blob.eventBody));
    const zipFile = await zip.generateAsync({ type: 'blob' });
    saveAs(zipFile, `noots-export ${moment().format('MM-DD, h-mm-ss a')}`);
  };

  getPath = (url: string) => escape(url);

  getBlobFile(url: string, mini: OperationDetailMini, operation: LongTermOperation) {
    return this.httpClient
      .get(url, {
        responseType: 'blob',
        reportProgress: true,
        observe: 'events',
      })
      .pipe(
        finalize(() => this.longTermOperationsHandler.finalize(operation, mini)),
        takeUntil(mini.obs),
        (x) => this.snackBarFileProcessingHandler.trackProcess(x, mini),
      );
  }

  // PHOTOS
  async exportAlbum(collection: PhotosCollection) {
    if (collection.items.length === 0) {
      // TODO SNACKBAR WITH WARNING
      return;
    }
    const operation = this.longTermOperationsHandler.addNewExportOperation('uploader.exportPhotos');
    const tasks = collection.items.map((photo) => {
      const path = this.getPath(photo.photoFromBig);
      const mini = this.longTermOperationsHandler.getNewMini(
        operation,
        LongTermsIcons.Image,
        photo.name,
        false,
      );
      return this.getBlobFile(path, mini, operation).pipe(
        map((blob) => {
          return {
            blob,
            name: photo.name,
          };
        }),
      );
    });

    await this.zipFiles(tasks);
  }

  async exportPhoto(photo: Photo) {
    const operation = this.longTermOperationsHandler.addNewExportOperation('uploader.exportPhotos');
    const mini = this.longTermOperationsHandler.getNewMini(
      operation,
      LongTermsIcons.Image,
      photo.name,
      false,
    );
    const path = this.getPath(photo.photoFromBig);
    const blob = await this.getBlobFile(path, mini, operation).toPromise();
    saveAs(blob.eventBody, photo.name);
  }

  // AUDIOS
  async exportPlaylist(collection: AudiosCollection) {
    if (collection.items.length === 0) {
      // TODO SNACKBAR WITH WARNING
      return;
    }
    const operation = this.longTermOperationsHandler.addNewExportOperation('uploader.exportAudios');
    const tasks = collection.items.map((audio) => {
      const mini = this.longTermOperationsHandler.getNewMini(
        operation,
        LongTermsIcons.Audio,
        audio.name,
        false,
      );
      const path = this.getPath(audio.audioPath);
      return this.getBlobFile(path, mini, operation).pipe(
        map((blob) => {
          return {
            blob,
            name: audio.name,
          };
        }),
      );
    });

    await this.zipFiles(tasks);
  }

  async exportAudio(audio: AudioModel) {
    const operation = this.longTermOperationsHandler.addNewExportOperation('uploader.exportAudios');
    const mini = this.longTermOperationsHandler.getNewMini(
      operation,
      LongTermsIcons.Audio,
      audio.name,
      false,
    );
    const path = this.getPath(audio.audioPath);
    const blob = await this.getBlobFile(path, mini, operation).toPromise();
    saveAs(blob.eventBody, audio.name);
  }

  // DOCUMENT
  async exportDocuments(collection: DocumentsCollection) {
    if (collection.items.length === 0) {
      // TODO SNACKBAR WITH WARNING
      return;
    }
    const operation = this.longTermOperationsHandler.addNewExportOperation(
      'uploader.exportDocuments',
    );
    const tasks = collection.items.map((document) => {
      const mini = this.longTermOperationsHandler.getNewMini(
        operation,
        LongTermsIcons.Document,
        document.name,
        false,
      );
      const path = this.getPath(document.documentPath);
      return this.getBlobFile(path, mini, operation).pipe(
        map((blob) => {
          return {
            blob,
            name: document.name,
          };
        }),
      );
    });

    await this.zipFiles(tasks);
  }

  async exportDocument(document: DocumentModel) {
    const operation = this.longTermOperationsHandler.addNewExportOperation(
      'uploader.exportDocuments',
    );
    const mini = this.longTermOperationsHandler.getNewMini(
      operation,
      LongTermsIcons.Document,
      document.name,
      false,
    );
    const path = this.getPath(document.documentPath);
    const blob = await this.getBlobFile(path, mini, operation).toPromise();
    saveAs(blob.eventBody, document.name);
  }

  // VIDEOS
  async exportVideos(collection: VideosCollection) {
    if (collection.items.length === 0) {
      // TODO SNACKBAR WITH WARNING
      return;
    }
    const operation = this.longTermOperationsHandler.addNewExportOperation('uploader.exportVideos');
    const tasks = collection.items.map((video) => {
      const mini = this.longTermOperationsHandler.getNewMini(
        operation,
        LongTermsIcons.Video,
        video.name,
        false,
      );
      const path = this.getPath(video.videoPath);
      return this.getBlobFile(path, mini, operation).pipe(
        map((blob) => {
          return {
            blob,
            name: video.name,
          };
        }),
      );
    });

    await this.zipFiles(tasks);
  }

  async exportVideo(video: VideoModel) {
    const operation = this.longTermOperationsHandler.addNewExportOperation('uploader.exportVideos');
    const mini = this.longTermOperationsHandler.getNewMini(
      operation,
      LongTermsIcons.Video,
      video.name,
      false,
    );
    const path = this.getPath(video.videoPath);
    const blob = await this.getBlobFile(path, mini, operation).toPromise();
    saveAs(blob.eventBody, video.name);
  }
}
