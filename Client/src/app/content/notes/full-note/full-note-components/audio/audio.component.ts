import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SafeUrl } from '@angular/platform-browser';
import { AudioService } from '../../../audio.service';
import { AudioModel } from '../../../models/content-model.model';
import { StreamAudioState } from '../../../models/stream-audio-state.model';
import { ClickableContentService } from '../../content-editor-services/clickable-content.service';

@Component({
  selector: 'app-audio',
  templateUrl: './audio.component.html',
  styleUrls: ['./audio.component.scss'],
})
export class AudioComponent implements OnInit, OnDestroy {
  @Output() playEvent = new EventEmitter<AudioModel>();

  @Output() pauseEvent = new EventEmitter();

  @Output() deleteAudio = new EventEmitter<string>();

  @Output() exportAudio = new EventEmitter<AudioModel>();

  @Output()
  clickEvent = new EventEmitter<string>();

  @Input() audio: AudioModel;

  @Input()
  isReadOnlyMode = false;

  destroy = new Subject();

  state: StreamAudioState;

  metadataParsed: Record<string, SafeUrl> = {
    duration: '',
    imageUrl: '',
  };

  constructor(
    public audioService: AudioService,
    private clickableService: ClickableContentService,
  ) {}

  async ngOnInit(): Promise<void> {
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
    this.metadataParsed = await this.audioService.getMetadata(this.audio.audioPath);
  }

  get isClicked() {
    return this.clickableService.isClicked(this.audio.fileId);
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
