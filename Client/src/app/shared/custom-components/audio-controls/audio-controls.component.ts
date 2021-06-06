import { ConnectionPositionPair } from '@angular/cdk/overlay';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AudioService } from 'src/app/content/notes/audio.service';
import { StreamAudioState } from 'src/app/content/notes/models/StreamAudioState';
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
    this.audioService.playStream(url, id).subscribe(() => {
      // listening for fun here
    });
  }

  openFile(item, index) {
    this.audioService.currentFile = { index, item };
    this.audioService.stop();
    this.playStream(item.url, item.id);
  }

  pause() {
    this.audioService.pause();
  }

  play() {
    this.audioService.play();
  }

  stop() {
    this.audioService.stop();
  }

  loop() {
    this.audioService.loop();
  }

  next() {
    const index = this.audioService.currentFile.index + 1;
    const file = this.audioService.playlist[index];
    this.openFile(file, index);
  }

  previous() {
    const index = this.audioService.currentFile.index - 1;
    const file = this.audioService.playlist[index];
    this.openFile(file, index);
  }

  isFirstPlaying() {
    return this.audioService.currentFile.index === 0;
  }

  isLastPlaying() {
    return this.audioService.currentFile.index === this.audioService.playlist.length - 1;
  }

  onSliderChangeEnd(change) {
    this.audioService.seekTo(change.value);
  }

  onSliderVolumeChangeEnd(change) {
    this.audioService.seekToVolume(change.value);
  }

  get audioName() {
    return this.audioService.currentFile?.audio?.name[0];
  }
}
