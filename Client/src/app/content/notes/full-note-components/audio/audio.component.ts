import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AudioService } from '../../audio.service';
import { AudioModel } from '../../models/ContentModel';
import { StreamAudioState } from '../../models/StreamAudioState';

@Component({
  selector: 'app-audio',
  templateUrl: './audio.component.html',
  styleUrls: ['./audio.component.scss'],
})
export class AudioComponent implements OnInit, OnDestroy {
  @Output() playEvent = new EventEmitter<AudioModel>();

  @Output() pauseEvent = new EventEmitter();

  @Input() audio: AudioModel;

  destroy = new Subject();

  state: StreamAudioState;

  constructor(public audioService: AudioService) {}

  ngOnInit(): void {
    this.audioService
      .getState()
      .pipe(takeUntil(this.destroy))
      .subscribe((state) => {
        if (this.audioService.currentFile?.fileId === this.audio.fileId) {
          this.state = state;
        } else {
          this.state = null;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  pauseMusic() {
    this.pauseEvent.emit();
  }

  playMusic() {
    this.playEvent.emit(this.audio);
  }
}
