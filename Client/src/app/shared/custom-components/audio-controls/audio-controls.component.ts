import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AudioService } from 'src/app/content/notes/audio.service';
import { StreamAudioState } from 'src/app/content/notes/models/StreamAudioState';

@Component({
  selector: 'app-audio-controls',
  templateUrl: './audio-controls.component.html',
  styleUrls: ['./audio-controls.component.scss'],
})
export class AudioControlsComponent implements OnInit, OnDestroy {
  destroy = new Subject();

  state: StreamAudioState;

  files: Array<any> = [];

  currentFile: any = {};

  constructor(private audioService: AudioService) {}

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
    this.currentFile = { index, item };
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
    const index = this.currentFile.index + 1;
    const file = this.files[index];
    this.openFile(file, index);
  }

  previous() {
    const index = this.currentFile.index - 1;
    const file = this.files[index];
    this.openFile(file, index);
  }

  isFirstPlaying() {
    return this.currentFile.index === 0;
  }

  isLastPlaying() {
    return this.currentFile.index === this.files.length - 1;
  }

  onSliderChangeEnd(change) {
    console.log(change);
    this.audioService.seekTo(change.value);
  }

  onSliderVolumeChangeEnd(change) {
    this.audioService.seekToVolume(change.value);
  }
}
