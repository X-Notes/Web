import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { AudioService } from '../../../../../audio.service';
import { StreamAudioState } from '../../../../../models/stream-audio-state.model';
import { ClickableContentService } from '../../../../content-editor-services/clickable-content.service';
import { AudioModel } from '../../../../../models/editor-models/audios-collection';
import { CollectionCursorUI } from '../../../cursors/collection-cursor-ui';

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

  @Input() isSelectModeActive = false;

  @Input()
  uiCursors$: Observable<CollectionCursorUI[]>;

  @Input()
  isReadOnlyMode = false;

  @Input()
  noteId: string;

  destroy = new Subject();

  state: StreamAudioState;

  constructor(
    public audioService: AudioService,
    private clickableService: ClickableContentService,
  ) {}

  get isClicked() {
    return this.clickableService.isClicked(this.audio.fileId);
  }

  get cursor$(): Observable<CollectionCursorUI> {
    return this.uiCursors$?.pipe(
      map((x) => {
        const array = x.filter((q) => q.itemId === this.audio.fileId);
        if (array.length > 0) {
          return array[0];
        }
        return null;
      }),
    );
  }

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

    this.audioService.tryToUpdateMetaDataIfNeed(this.audio);
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
