import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
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
import { ThemeENUM } from 'src/app/shared/enums/theme.enum';
import { AudioService } from '../../../audio.service';
import { ExportService } from '../../../export.service';
import { ParentInteraction } from '../../models/parent-interaction.interface';
import { TypeUploadFormats } from '../../models/enums/type-upload-formats.enum';
import { ClickableContentService } from '../../content-editor-services/clickable-content.service';
import { FocusDirection, SetFocus } from '../../models/set-focus';
import { CollectionService } from '../collection-services/collection.service';
import { ClickableSelectableEntities } from '../../content-editor-services/clickable-selectable-entities.enum';
import { AudioModel, AudiosCollection } from '../../../models/editor-models/audios-collection';
import { ContentModelBase } from '../../../models/editor-models/content-model-base';

@Component({
  selector: 'app-audio-note',
  templateUrl: './audio-note.component.html',
  styleUrls: ['./audio-note.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AudioNoteComponent
  extends CollectionService
  implements ParentInteraction, OnInit, OnDestroy {
  @ViewChild('uploadAudiosRef') uploadAudiosRef: ElementRef;

  @Output()
  deleteAudioEvent = new EventEmitter<string>();

  @Input()
  theme: ThemeENUM;

  @Input()
  content: AudiosCollection;

  themeE = ThemeENUM;

  destroy = new Subject<void>();

  formats = TypeUploadFormats.audios;

  constructor(
    private audioService: AudioService,
    private exportService: ExportService,
    private clickableContentService: ClickableContentService,
    private host: ElementRef,
    cdr: ChangeDetectorRef,
  ) {
    super(cdr);
  }

  getHost() {
    return this.host;
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  ngOnInit(): void {}

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

  async uploadAudios(files: File[]) {
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

  isFocusToNext(entity: SetFocus) {
    if (entity.status === FocusDirection.Up && this.titleComponent.isFocusedOnTitle) {
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
        this.titleComponent.focusOnTitle();
        this.clickAudioHandler(null);
      } else {
        this.clickAudioHandler(this.content.audios[index - 1].fileId);
        (document.activeElement as HTMLInputElement).blur();
      }
      return;
    }

    if (entity.status === FocusDirection.Up && this.content.audios.length > 0) {
      this.clickAudioHandler(this.content.audios[this.content.audios.length - 1].fileId);
      (document.activeElement as HTMLInputElement).blur();
      return;
    }

    if (entity.status === FocusDirection.Up && this.content.audios.length === 0) {
      this.titleComponent.focusOnTitle();
      this.clickAudioHandler(null);
      return;
    }

    if (entity.status === FocusDirection.Down && isExist) {
      const index = this.content.audios.findIndex((x) => x.fileId === entity.itemId);
      this.clickAudioHandler(this.content.audios[index + 1].fileId);
      (document.activeElement as HTMLInputElement).blur();
      return;
    }

    if (entity.status === FocusDirection.Down) {
      if (this.titleComponent.isFocusedOnTitle) {
        // eslint-disable-next-line prefer-destructuring
        this.clickAudioHandler(this.content.audios[0].fileId);
        (document.activeElement as HTMLInputElement).blur();
      } else {
        this.titleComponent.focusOnTitle();
        this.clickAudioHandler(null);
      }
    }
  };

  setFocusToEnd = () => {};

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  updateHTML = (content: string) => {};

  getEditableNative = () => {};

  getContent(): ContentModelBase {
    return this.content;
  }

  mouseEnter = ($event: any) => {
    this.isMouseOver = true;
  };

  mouseLeave = ($event: any) => {
    this.isMouseOver = false;
  };

  onTitleChangeInput(name: string) {
    this.content.name = name;
    this.changeTitleEvent.emit(name);
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
