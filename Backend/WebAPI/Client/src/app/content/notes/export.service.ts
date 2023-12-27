import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as JSZip from 'jszip';
import { forkJoin, Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { saveAs } from 'file-saver';
import { LongTermOperationsHandlerService } from '../long-term-operations-handler/services/long-term-operations-handler.service';
import { LongTermOperation } from '../long-term-operations-handler/models/long-term-operation';
import { SnackbarService } from 'src/app/shared/services/snackbar/snackbar.service';
import { TranslateService } from '@ngx-translate/core';
import dayjs from 'dayjs';
import { InterceptorSkipToken } from 'src/app/core/token-interceptor.service';
import { AudiosCollection, AudioModel } from 'src/app/editor/entities/contents/audios-collection';
import { DocumentsCollection, DocumentModel } from 'src/app/editor/entities/contents/documents-collection';
import { PhotosCollection, Photo } from 'src/app/editor/entities/contents/photos-collection';
import { VideosCollection, VideoModel } from 'src/app/editor/entities/contents/videos-collection';

@Injectable({
  providedIn: 'root',
})
export class ExportService {
  constructor(
    private httpClient: HttpClient,
    private longTermOperationsHandler: LongTermOperationsHandlerService,
    private snackbarService: SnackbarService,
    private translateService: TranslateService,
  ) {}

  zipFiles = async (tasks: Observable<{ blob: Blob; name: string }>[]) => {
    const resp = await forkJoin(tasks).toPromise();
    const zip = new JSZip();
    resp.forEach((x) => zip.file(x.name, x.blob));
    const zipFile = await zip.generateAsync({ type: 'blob' });
    saveAs(zipFile, `x-notes-export ${dayjs().format('LLL')}`);
  };

  getBlobFile(url: string, operation: LongTermOperation) {
    const headers = new HttpHeaders().set(InterceptorSkipToken, '');
    return this.httpClient
      .get(url, {
        headers,
        responseType: 'blob'
      })
      .pipe(finalize(() => this.longTermOperationsHandler.finalize(operation)));
  }

  // PHOTOS
  async exportAlbum(collection: PhotosCollection) {
    if (collection.items.length === 0) {
      const message = this.translateService.instant('snackBar.noItemInExport');
      this.snackbarService.openSnackBar(message, null, null);
      return;
    }
    const operation = this.longTermOperationsHandler.addNewExportOperation('uploader.exportPhotos');
    const tasks = collection.items.map((photo) => {
      const path = photo.photoFromBig;
      return this.getBlobFile(path, operation).pipe(
        map((blob) => {
          return {
            blob,
            name: photo.name,
          };
        }),
      );
    });

    await this.zipFiles(tasks);
    this.longTermOperationsHandler.finalize(operation);
  }

  async exportPhoto(photo: Photo) {
    const operation = this.longTermOperationsHandler.addNewExportOperation('uploader.exportPhotos');
    const path = photo.photoFromBig;
    const blob = await this.getBlobFile(path, operation).toPromise();
    saveAs(blob, photo.name);
  }

  // AUDIOS
  async exportPlaylist(collection: AudiosCollection) {
    if (collection.items.length === 0) {
      const message = this.translateService.instant('snackBar.noItemInExport');
      this.snackbarService.openSnackBar(message, null, null);
      return;
    }
    const operation = this.longTermOperationsHandler.addNewExportOperation('uploader.exportAudios');
    const tasks = collection.items.map((audio) => {
      const path = audio.audioPath;
      return this.getBlobFile(path, operation).pipe(
        map((blob) => {
          return {
            blob,
            name: audio.name,
          };
        }),
      );
    });

    await this.zipFiles(tasks);
    this.longTermOperationsHandler.finalize(operation);
  }

  async exportAudio(audio: AudioModel) {
    const operation = this.longTermOperationsHandler.addNewExportOperation('uploader.exportAudios');
    const path = audio.audioPath;
    const blob = await this.getBlobFile(path, operation).toPromise();
    saveAs(blob, audio.name);
  }

  // DOCUMENT
  async exportDocuments(collection: DocumentsCollection) {
    if (collection.items.length === 0) {
      const message = this.translateService.instant('snackBar.noItemInExport');
      this.snackbarService.openSnackBar(message, null, null);
      return;
    }
    const operation = this.longTermOperationsHandler.addNewExportOperation(
      'uploader.exportDocuments',
    );
    const tasks = collection.items.map((document) => {
      const path = document.documentPath;
      return this.getBlobFile(path, operation).pipe(
        map((blob) => {
          return {
            blob,
            name: document.name,
          };
        }),
      );
    });

    await this.zipFiles(tasks);
    this.longTermOperationsHandler.finalize(operation);
  }

  async exportDocument(document: DocumentModel) {
    const operation = this.longTermOperationsHandler.addNewExportOperation(
      'uploader.exportDocuments',
    );
    const path = document.documentPath;
    const blob = await this.getBlobFile(path, operation).toPromise();
    saveAs(blob, document.name);
  }

  // VIDEOS
  async exportVideos(collection: VideosCollection) {
    if (collection.items.length === 0) {
      const message = this.translateService.instant('snackBar.noItemInExport');
      this.snackbarService.openSnackBar(message, null, null);
      return;
    }
    const operation = this.longTermOperationsHandler.addNewExportOperation('uploader.exportVideos');
    const tasks = collection.items.map((video) => {
      const path = video.videoPath;
      return this.getBlobFile(path, operation).pipe(
        map((blob) => {
          return {
            blob,
            name: video.name,
          };
        }),
      );
    });

    await this.zipFiles(tasks);
    this.longTermOperationsHandler.finalize(operation);
  }

  async exportVideo(video: VideoModel) {
    const operation = this.longTermOperationsHandler.addNewExportOperation('uploader.exportVideos');
    const path = video.videoPath;
    const blob = await this.getBlobFile(path, operation).toPromise();
    saveAs(blob, video.name);
  }
}
