import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import * as JSZip from 'jszip';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Album, AudioModel, DocumentModel, Photo, PlaylistModel } from './models/ContentModel';
import { NoteStore } from './state/notes-state';
import { saveAs } from 'file-saver';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root',
})
export class ExportService {
  constructor(private httpClient: HttpClient, private store: Store) {}

  private getBlobFile(url: string) {
    return this.httpClient.get(url, { responseType: 'blob' });
  }

  getPath(url: string) {
    const authorNoteId = this.store.selectSnapshot(NoteStore.authorId);
    return `${environment.storage}/${authorNoteId}/${escape(url)}`;
  }

  async exportAlbum(album: Album) {
    const tasks = album.photos.map((photo) => {
      const path = this.getPath(photo.photoFromBig);
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
    const path = this.getPath(photo.photoFromBig);
    const blob = await this.getBlobFile(path).toPromise();
    saveAs(blob, photo.name);
  }

  async exportPlaylist(playlist: PlaylistModel) {
    const tasks = playlist.audios.map((audio) => {
      const path = this.getPath(audio.audioPath);
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
    const path = this.getPath(audio.audioPath);
    const blob = await this.getBlobFile(path).toPromise();
    saveAs(blob, audio.name);
  }

  async exportDocument(document: DocumentModel) {
    const path = this.getPath(document.documentPath);
    const blob = await this.getBlobFile(path).toPromise();
    saveAs(blob, document.name);
  }
}
