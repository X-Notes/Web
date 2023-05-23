import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { AudioService } from '../../../../../audio.service';
import { StreamAudioState } from '../../../../../models/stream-audio-state.model';
import { ClickableContentService } from '../../../../content-editor-services/clickable-content.service';
import { AudioModel } from '../../../../../models/editor-models/audios-collection';
import { CollectionCursorUI } from '../../../cursors/collection-cursor-ui';
import { ThemeENUM } from 'src/app/shared/enums/theme.enum';

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
  theme: ThemeENUM;

  themeENUM = ThemeENUM;

  @Input()
  uiCursors$: Observable<CollectionCursorUI[]>;

  @Input()
  isReadOnlyMode = false;

  @Input()
  noteId: string;

  destroy = new Subject();

  constructor(
    private audioService: AudioService,
    private clickableService: ClickableContentService,
  ) {}

  get isClicked() {
    return this.clickableService.isClicked(this.audio.fileId);
  }

  get state$() {
    return this.audioService.stateChange$.pipe(map((x) => (x.id === this.audio.fileId ? x : null)));
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

  ngOnInit(): void {
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
