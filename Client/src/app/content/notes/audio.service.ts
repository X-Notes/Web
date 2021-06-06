import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as moment from 'moment';
import { StreamAudioState } from './models/StreamAudioState';
import { AudioEvents } from './models/AudioEvents.enum';

@Injectable({
  providedIn: 'root',
})
export class AudioService {
  audioEvents = AudioEvents;

  currentFile: any = {};

  playlist = [];

  private state: StreamAudioState = {
    id: '',
    playing: false,
    readableCurrentTime: '',
    readableDuration: '',
    duration: undefined,
    currentTime: undefined,
    canplay: false,
    error: false,
    loop: false,
    currentVolume: 0.25,
  };

  private stop$ = new Subject();

  private audioObj = new Audio();

  private stateChange: BehaviorSubject<StreamAudioState> = new BehaviorSubject(this.state);

  getState(): Observable<StreamAudioState> {
    return this.stateChange;
  }

  playStream(url, id) {
    return this.streamObservable(url, id).pipe(takeUntil(this.stop$));
  }

  play() {
    this.audioObj.play();
  }

  pause() {
    this.audioObj.pause();
  }

  stop() {
    this.stop$.next();
  }

  loop() {
    this.audioObj.loop = !this.audioObj.loop;
  }

  seekTo(seconds) {
    this.audioObj.currentTime = seconds;
  }

  seekToVolume(volume) {
    this.audioObj.volume = volume;
  }

  formatTime = (time: number, format: string = 'mm:ss') => {
    const momentTime = time * 1000;
    return moment.utc(momentTime).format(format);
  };

  private streamObservable(url, id) {
    return new Observable((observer) => {
      this.state.id = id;
      this.audioObj.src = url;
      this.audioObj.volume = this.state.currentVolume;
      this.audioObj.load();

      const handler = (event: Event) => {
        this.updateStateEvents(event);
        observer.next(event);
      };

      this.addEvents(this.audioObj, Object.keys(this.audioEvents), handler);
      return () => {
        this.audioObj.pause();
        this.audioObj.currentTime = 0;
        this.removeEvents(this.audioObj, Object.keys(this.audioEvents), handler);
        this.resetState();
      };
    });
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
    this.state.loop = this.audioObj.loop;
    switch (event.type) {
      case this.audioEvents.canplay:
        this.state.duration = this.audioObj.duration;
        this.state.readableDuration = this.formatTime(this.state.duration);
        this.state.canplay = true;
        break;
      case this.audioEvents.playing:
        this.state.playing = true;
        break;
      case this.audioEvents.pause:
        this.state.playing = false;
        break;
      case this.audioEvents.timeupdate:
        this.state.currentTime = this.audioObj.currentTime;
        this.state.readableCurrentTime = this.formatTime(this.state.currentTime);
        break;
      case this.audioEvents.volumechange:
        this.state.currentVolume = this.audioObj.volume;
        break;
      case this.audioEvents.ended:
        if (this.audioObj.loop) {
          this.state.currentTime = 0;
          this.state.playing = true;
          this.state.loop = true;
          this.play();
        }
        break;
      case this.audioEvents.error:
        this.resetState();
        this.state.error = true;
        break;
      default:
        throw new Error('Error in audio player');
    }
    this.stateChange.next(this.state);
  }

  private resetState() {
    this.state = {
      id: '',
      playing: false,
      readableCurrentTime: '',
      readableDuration: '',
      duration: undefined,
      currentTime: undefined,
      canplay: false,
      error: false,
      loop: false,
      currentVolume: 0.25,
    };
  }
}
