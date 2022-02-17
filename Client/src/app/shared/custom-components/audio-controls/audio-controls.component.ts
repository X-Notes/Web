import { ConnectionPositionPair } from '@angular/cdk/overlay';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AudioService } from 'src/app/content/notes/audio.service';
import { AudioModel } from 'src/app/content/notes/models/editor-models/audios-collection';
import { StreamAudioState } from 'src/app/content/notes/models/stream-audio-state.model';
import { showDropdown } from '../../services/personalization.service';

@Component({
  selector: 'app-audio-controls',
  templateUrl: './audio-controls.component.html',
  styleUrls: ['./audio-controls.component.scss'],
  animations: [showDropdown],
})
export class AudioControlsComponent implements OnInit, OnDestroy {
  destroy = new Subject();

  state: StreamAudioState;

  isOpen = false;

  public positions = [
    new ConnectionPositionPair(
      {
        originX: 'start',
        originY: 'top',
      },
      { overlayX: 'start', overlayY: 'bottom' },
      0,
      1,
    ),
  ];

  constructor(public audioService: AudioService) {}

  get isFirstPlaying() {
    return (
      this.audioService.playlist.findIndex(
        (x) => x.fileId === this.audioService.currentFile.fileId,
      ) === 0
    );
  }

  get isLastPlaying() {
    return (
      this.audioService.playlist.findIndex(
        (x) => x.fileId === this.audioService.currentFile.fileId,
      ) ===
      this.audioService.playlist.length - 1
    );
  }

  // eslint-disable-next-line consistent-return
  get volumeIcon(): string {
    if (this.state?.currentVolume === 0) {
      return 'volume_off';
    }
    if (this.state?.currentVolume < 0.5 && this.state?.currentVolume !== 0) {
      return 'volume_down';
    }
    if (this.state?.currentVolume >= 0.5) {
      return 'volume_up';
    }
  }

  get audioName() {
    return this.audioService.currentFile?.name;
  }

  ngOnInit(): void {
    this.audioService
      .getState()
      .pipe(takeUntil(this.destroy))
      .subscribe((state) => {
        this.state = state;
      });
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  playStream(url, id) {
    this.audioService.playStream(url, id).subscribe();
  }

  openFile(item) {
    this.audioService.currentFile = item;
    this.audioService.stop();
    this.playStream(item.audioPath, item.id);
  }

  pause() {
    this.audioService.pause();
  }

  play() {
    this.audioService.play();
  }

  play2(audio: AudioModel) {
    if (this.audioService.currentFile?.fileId !== audio.fileId) {
      this.openFile(audio);
    }
    this.audioService.play();
  }

  stop() {
    this.audioService.stop();
  }

  loop() {
    this.audioService.loop();
  }

  mute() {
    this.audioService.mute();
  }

  next() {
    let index = this.audioService.playlist.findIndex(
      (x) => x.fileId === this.audioService.currentFile.fileId,
    );
    index += 1;
    if (this.audioService.playlist[index]) {
      const file = this.audioService.playlist[index];
      this.openFile(file);
    } else {
      throw new Error('index doest not exist');
    }
  }

  previous() {
    let index = this.audioService.playlist.findIndex(
      (x) => x.fileId === this.audioService.currentFile.fileId,
    );
    index -= 1;
    if (this.audioService.playlist[index]) {
      const file = this.audioService.playlist[index];
      this.openFile(file);
    } else {
      throw new Error('index doest not exist');
    }
  }

  onSliderChangeEnd(change) {
    this.audioService.seekTo(change.value);
  }

  onSliderVolumeChangeEnd(change) {
    this.audioService.seekToVolume(change.value);
  }
}
