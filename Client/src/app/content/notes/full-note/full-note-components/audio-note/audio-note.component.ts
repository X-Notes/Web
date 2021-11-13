import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { updateNoteContentDelay } from 'src/app/core/defaults/bounceDelay';
import { ThemeENUM } from 'src/app/shared/enums/theme.enum';
import { AudioService } from '../../../audio.service';
import { ExportService } from '../../../export.service';
import { AudioModel, ContentModel, AudiosCollection } from '../../../models/content-model.model';
import { ParentInteraction } from '../../models/parent-interaction.interface';
import { TypeUploadFormats } from '../../models/enums/type-upload-formats.enum';
import { UploadFileToEntity } from '../../models/upload-files-to-entity';
import { ClickableContentService } from '../../content-editor-services/clickable-content.service';
import { FocusDirection, SetFocus } from '../../models/set-focus';
import { CollectionService } from '../collection-services/collection.service';
import { ClickableSelectableEntities } from '../../content-editor-services/clickable-selectable-entities.enum';

@Component({
  selector: 'app-audio-note',
  templateUrl: './audio-note.component.html',
  styleUrls: ['./audio-note.component.scss'],
})
export class AudioNoteComponent
  extends CollectionService
  implements ParentInteraction, OnInit, OnDestroy {
  @ViewChild('titleHtml') titleHtml: ElementRef;

  @ViewChild('uploadAudiosRef') uploadAudiosRef: ElementRef;

  @Output()
  deleteContentEvent = new EventEmitter<string>();

  @Output()
  deleteAudioEvent = new EventEmitter<string>();

  @Output()
  changeTitleEvent = new EventEmitter<string>();

  @Output()
  uploadEvent = new EventEmitter<UploadFileToEntity>();

  @Input()
  isReadOnlyMode = false;

  @Input()
  isSelected = false;

  @Input()
  theme: ThemeENUM;

  @Input()
  content: AudiosCollection;

  themeE = ThemeENUM;

  destroy = new Subject<void>();

  formats = TypeUploadFormats.audios;

  namePlaylistChanged: Subject<string> = new Subject<string>();

  constructor(
    private audioService: AudioService,
    private exportService: ExportService,
    private clickableContentService: ClickableContentService,
    private host: ElementRef,
  ) {
    super();
  }

  getHost() {
    return this.host;
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  ngOnInit(): void {
    this.namePlaylistChanged
      .pipe(takeUntil(this.destroy), debounceTime(updateNoteContentDelay))
      .subscribe((name) => {
        this.content.name = name;
        this.changeTitleEvent.emit(name);
      });
  }

  clickAudioHandler(audioId: string) {
    this.clickableContentService.set(ClickableSelectableEntities.Audio, audioId, this.content.id);
  }

  playStream(url, id) {
    this.audioService.playStream(url, id).subscribe(() => {
      // TODO listening for fun here
    });
  }

  uploadHandler = () => {
    this.uploadAudiosRef.nativeElement.click();
  };

  async uploadAudios(event) {
    const files = event.target.files as File[];
    if (files?.length > 0) {
      this.uploadEvent.emit({ contentId: this.content.id, files: [...files] });
    }
  }

  openFile(audio: AudioModel) {
    this.audioService.stop();
    if (this.audioService.currentFile?.fileId !== audio.fileId) {
      this.audioService.playlist = this.content.audios;
      this.audioService.currentFile = audio;
      this.playStream(audio.audioPath, audio.fileId);
    }
  }

  get isEmpty(): boolean {
    if (!this.content.audios || this.content.audios.length === 0) {
      return true;
    }
    return false;
  }

  async exportPlaylist(playlist: AudiosCollection) {
    await this.exportService.exportPlaylist(playlist);
  }

  async exportAudio(audio: AudioModel) {
    await this.exportService.exportAudio(audio);
  }

  pause() {
    this.audioService.pause();
  }

  play(audio: AudioModel) {
    if (this.audioService.currentFile?.fileId !== audio.fileId) {
      this.openFile(audio);
    }
    this.audioService.play();
  }

  deleteAudioHandler(audioId: string) {
    this.deleteAudioEvent.emit(audioId);
  }

  isTitleFocused = (): boolean => document.activeElement === this.titleHtml.nativeElement;

  isFocusToNext(entity: SetFocus) {
    if (entity.status === FocusDirection.Up && this.isTitleFocused()) {
      return true;
    }
    if (entity.status === FocusDirection.Down) {
      const index = this.content.audios.findIndex((x) => x.fileId === entity.itemId);
      return index === this.content.audios.length - 1;
    }
    return false;
  }

  setFocus = (entity?: SetFocus) => {
    const isExist = this.content.audios.some((x) => x.fileId === entity.itemId);

    if (entity.status === FocusDirection.Up && isExist) {
      const index = this.content.audios.findIndex((x) => x.fileId === entity.itemId);
      if (index === 0) {
        this.titleHtml.nativeElement.focus();
        this.clickAudioHandler(null);
      } else {
        this.clickAudioHandler(this.content.audios[index - 1].fileId);
        (document.activeElement as HTMLInputElement).blur();
      }
      return;
    }

    if (entity.status === FocusDirection.Up) {
      this.clickAudioHandler(this.content.audios[this.content.audios.length - 1].fileId);
      (document.activeElement as HTMLInputElement).blur();
      return;
    }

    if (entity.status === FocusDirection.Down && isExist) {
      const index = this.content.audios.findIndex((x) => x.fileId === entity.itemId);
      this.clickAudioHandler(this.content.audios[index + 1].fileId);
      (document.activeElement as HTMLInputElement).blur();
      return;
    }

    if (entity.status === FocusDirection.Down) {
      if (this.isTitleFocused()) {
        // eslint-disable-next-line prefer-destructuring
        this.clickAudioHandler(this.content.audios[0].fileId);
        (document.activeElement as HTMLInputElement).blur();
      } else {
        this.titleHtml.nativeElement.focus();
        this.clickAudioHandler(null);
      }
    }
  };

  setFocusToEnd = () => {};

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  updateHTML = (content: string) => {};

  getEditableNative = () => {};

  getContent(): ContentModel {
    return this.content;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  mouseEnter = ($event: any) => {};

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  mouseOut = ($event: any) => {};

  onTitleChangeInput($event) {
    this.namePlaylistChanged.next($event.target.innerText);
  }

  // eslint-disable-next-line class-methods-use-this
  backspaceUp() {}

  // eslint-disable-next-line class-methods-use-this
  backspaceDown() {
    this.checkForDelete();
  }

  deleteDown() {
    this.checkForDelete();
  }

  checkForDelete() {
    const audio = this.content.audios.find((x) => this.clickableContentService.isClicked(x.fileId));
    if (audio) {
      this.deleteAudioEvent.emit(audio.fileId);
    }
  }
}
