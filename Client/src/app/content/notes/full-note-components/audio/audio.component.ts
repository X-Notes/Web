import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AudioService } from '../../audio.service';
import { StreamAudioState } from '../../models/StreamAudioState';

@Component({
  selector: 'app-audio',
  templateUrl: './audio.component.html',
  styleUrls: ['./audio.component.scss'],
})
export class AudioComponent implements OnInit, OnDestroy {
  @Input() item: any;

  destroy = new Subject();

  stateInner: StreamAudioState;

  constructor(public audioService: AudioService) {}

  ngOnInit(): void {
    this.audioService
      .getState()
      .pipe(takeUntil(this.destroy))
      .subscribe((state) => {
        if (this.audioService.currentFile?.audio?.id === this.item.audio.id) {
          this.stateInner = state;
        }
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

  openFile() {
    this.audioService.stop();
    if (this.audioService.currentFile?.audio?.id !== this.item.audio.id) {
      this.audioService.currentFile = this.item;
      this.playStream(this.item.audio.url, this.item.audio.id);
    }
  }

  pause() {
    if (this.audioService.currentFile?.audio?.id !== this.item.audio.id) {
      this.audioService.state = this.stateInner;
    }
    this.audioService.pause();
  }

  play() {
    if (this.audioService.currentFile?.audio?.id !== this.item.audio.id) {
      this.openFile();
    }
    this.audioService.play();
  }
}
