import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Store } from '@ngxs/store';
import * as mm from 'music-metadata-browser';
import { generateFormData } from 'src/app/core/defaults/form-data-generator';
import { StreamAudioState } from './models/stream-audio-state.model';
import { AudioEvents } from './models/enums/audio-events.enum';
import { NoteStore } from './state/notes-state';
import { ApiNoteFilesService } from 'src/app/editor/api/api-editor-files.service';
import { AudioModel } from 'src/app/editor/entities/contents/audios-collection';
import { FileNoteTypes } from 'src/app/editor/entities/files/file-note-types.enum';

@Injectable({
  providedIn: 'root',
})
export class AudioService {
  audioEvents = AudioEvents;

  currentFile: AudioModel;

  playlist: AudioModel[] = [];

  prevVolumeState: number;

  private state: StreamAudioState = new StreamAudioState(0.25);

  private audioObj = new Audio();

  public stateChange$: BehaviorSubject<StreamAudioState> = new BehaviorSubject(this.state);

  constructor(private store: Store, private apiNoteFilesService: ApiNoteFilesService) {}

  getState(): StreamAudioState {
    return this.stateChange$.getValue();
  }

  resetCurrent() {
    this.currentFile = null;
    this.playlist = null;
    this.resetAudio();
    this.resetState();
    this.stateChange$.next(this.state);
  }

  openFileAndPlay(audio: AudioModel) {
    this.currentFile = audio;
    this.runAudio(audio.audioPath, audio.fileId);
  }

  play() {
    this.audioObj.play();
  }

  pause() {
    this.audioObj.pause();
  }

  loop() {
    this.audioObj.loop = !this.audioObj.loop;
    this.state.loop = this.audioObj.loop;
  }

  mute() {
    const { currentVolume } = this.state;
    if (this.audioObj.muted) {
      this.audioObj.muted = false;
      this.seekToVolume(this.prevVolumeState);
    } else {
      this.audioObj.muted = true;
      this.prevVolumeState = currentVolume;
      this.seekToVolume(0);
    }
  }

  seekTo(seconds) {
    this.audioObj.currentTime = seconds;
  }

  seekToVolume(volume) {
    this.audioObj.volume = volume;
  }

  async tryToUpdateMetaDataIfNeed(audio: AudioModel) {
    if (audio.isNeedUpdateMetaData()) {
      try {
        const [file, duration] = await this.getMetadata(audio.audioPath);
        const noteId = this.store.selectSnapshot(NoteStore.oneFull)?.id;
        let fileId = null;
        if (file && noteId) {
          const formData = generateFormData(file);
          const response = await this.apiNoteFilesService
            .uploadFilesToNoteNoProgressReport(formData, noteId, FileNoteTypes.Photo)
            .toPromise();
          if (response?.data && response?.data[0]) {
            fileId = response.data[0].id;
          }
        }
        const resp = await this.apiNoteFilesService
          .updateFileMetaData(audio.fileId, Math.floor(duration), fileId)
          .toPromise();
        if (resp.success && resp?.data?.metaData) {
          // eslint-disable-next-line no-param-reassign
          audio.secondsDuration = resp.data.metaData?.secondsDuration;
          // eslint-disable-next-line no-param-reassign
          audio.pathToImage = resp.data.metaData?.imagePath;
        }
      } catch (e) {
        console.log(e);
      }
    }
  }

  private async getMetadata(audioPath): Promise<[Blob, number]> {
    let imageBlob: Blob;

    const metadata = await mm.fetchFromUrl(audioPath, {
      skipPostHeaders: true,
      includeChapters: false,
      duration: false,
    });

    if (metadata && metadata.common && metadata.common && metadata.common.picture) {
      const arrayBufferView = new Uint8Array(metadata.common.picture[0].data.buffer);
      imageBlob = new Blob([arrayBufferView], { type: 'image/png' });
    }

    return [imageBlob, metadata.format.duration];
  }

  runAudio(url: string, id: string): void {
    this.resetAudio();
    this.audioObj = new Audio();
    this.state.id = id;
    this.audioObj.src = url;
    this.audioObj.volume = this.state.currentVolume;
    this.audioObj.load();
    const handler = (event: Event) => this.updateStateEvents(event);
    this.addEvents(this.audioObj, Object.keys(this.audioEvents), handler);
  }

  resetAudio(): void {
    if (this.audioObj) {
      this.audioObj.pause();
      const handler = (event: Event) => this.updateStateEvents(event);
      this.removeEvents(this.audioObj, Object.keys(this.audioEvents), handler);
      this.audioObj = null;
    }
    this.resetState();
  }

  private addEvents = (obj, events, handler) => {
    events.forEach((event) => {
      obj.addEventListener(event, handler);
    });
  };

  private removeEvents = (obj, events, handler) => {
    events.forEach((event) => {
      obj.removeEventListener(event, handler);
    });
  };

  private updateStateEvents(event: Event): void {
    if(!this.audioObj) {
      this.stateChange$.next(this.state);
      return;
    }
    switch (event.type) {
      case this.audioEvents.play:
      case this.audioEvents.loadstart:
      case this.audioEvents.loadedmetadata:
      case this.audioEvents.canplay:
        this.state.canplay = true;
        this.play();
        break;
      case this.audioEvents.playing:
        this.state.playing = true;
        break;
      case this.audioEvents.pause:
        this.state.playing = false;
        break;
      case this.audioEvents.timeupdate:
        this.state.currentTime = this.audioObj.currentTime;
        break;
      case this.audioEvents.volumechange:
        this.state.currentVolume = this.audioObj.volume;
        if (this.state.currentVolume) {
          this.audioObj.muted = false;
        }
        break;
      case this.audioEvents.ended:
        if (this.audioObj.loop) {
          this.state.currentTime = 0;
          this.state.playing = true;
          this.state.loop = true;
          this.play();
        } else {
          this.playNextAudio();
        }
        break;
      case this.audioEvents.error:
        this.resetState();
        this.state.error = true;
        break;
      default:
        throw new Error('Error in audio player');
    }
    this.stateChange$.next(this.state);
  }

  private playNextAudio(): void {
    const index = this.playlist.indexOf(this.currentFile);
    const nextIndex = index + 1;
    if (index !== -1 && nextIndex < this.playlist.length) {
      this.currentFile = this.playlist[nextIndex];
      this.openFileAndPlay(this.currentFile);
    }
  }

  private resetState() {
    this.state = new StreamAudioState(this.state?.currentVolume ?? 0.25);
  }
}
