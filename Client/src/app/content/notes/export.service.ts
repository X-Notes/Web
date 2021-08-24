import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as JSZip from 'jszip';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import {
  PhotosCollection,
  AudioModel,
  DocumentsCollection,
  Photo,
  AudiosCollection,
} from './models/content-model.model';
import { saveAs } from 'file-saver';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root',
})
export class ExportService {
  constructor(private httpClient: HttpClient) {}

  private getBlobFile(url: string) {
    return this.httpClient.get(url, { responseType: 'blob' });
  }

  getPath(url: string, authorNoteId: string) {
    return `${environment.storage}/${authorNoteId}/${escape(url)}`;
  }

  async exportAlbum(album: PhotosCollection) {
    const tasks = album.photos.map((photo) => {
      const path = this.getPath(photo.photoFromBig, photo.authorId);
      return this.getBlobFile(path).pipe(
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

  async zipFiles(tasks: Observable<{ blob: Blob; name: string }>[]) {
    const resp = await forkJoin(tasks).toPromise();
    const zip = new JSZip();
    resp.forEach((x) => zip.file(x.name, x.blob));
    const zipFile = await zip.generateAsync({ type: 'blob' });
    saveAs(zipFile, 'noots-export ' + moment().format('MM-DD, h-mm-ss a'));
  }

  async exportPhoto(photo: Photo) {
    const path = this.getPath(photo.photoFromBig, photo.authorId);
    const blob = await this.getBlobFile(path).toPromise();
    saveAs(blob, photo.name);
  }

  async exportPlaylist(playlist: AudiosCollection) {
    const tasks = playlist.audios.map((audio) => {
      const path = this.getPath(audio.audioPath, audio.authorId);
      return this.getBlobFile(path).pipe(
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
    const path = this.getPath(audio.audioPath, audio.authorId);
    const blob = await this.getBlobFile(path).toPromise();
    saveAs(blob, audio.name);
  }

  async exportDocument(collection: DocumentsCollection) {

    const tasks = collection.documents.map((audio) => {
      const path = this.getPath(audio.documentPath, audio.authorId);
      return this.getBlobFile(path).pipe(
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
}
