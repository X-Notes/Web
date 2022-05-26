import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { AudioService } from '../../../audio.service';
import { ExportService } from '../../../export.service';
import { ParentInteraction } from '../../models/parent-interaction.interface';
import { TypeUploadFormats } from '../../models/enums/type-upload-formats.enum';
import { ClickableContentService } from '../../content-editor-services/clickable-content.service';
import { FocusDirection, SetFocus } from '../../models/set-focus';
import { CollectionService } from '../collection-services/collection.service';
import { ClickableSelectableEntities } from '../../content-editor-services/clickable-selectable-entities.enum';
import { AudioModel, AudiosCollection } from '../../../models/editor-models/audios-collection';
import { ApiBrowserTextService } from '../../../api-browser-text.service';

@Component({
  selector: 'app-audio-note',
  templateUrl: './audio-note.component.html',
  styleUrls: ['./audio-note.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AudioNoteComponent
  extends CollectionService<AudiosCollection>
  implements ParentInteraction
{
  @ViewChild('uploadAudiosRef') uploadAudiosRef: ElementRef;

  formats = TypeUploadFormats.audios;

  constructor(
    private audioService: AudioService,
    private exportService: ExportService,
    clickableContentService: ClickableContentService,
    private host: ElementRef,
    cdr: ChangeDetectorRef,
    apiBrowserTextService: ApiBrowserTextService,
  ) {
    super(cdr, clickableContentService, apiBrowserTextService);
  }

  get isEmpty(): boolean {
    if (!this.content.items || this.content.items.length === 0) {
      return true;
    }
    return false;
  }

  getHost() {
    return this.host;
  }

  clickAudioHandler(audioId: string) {
    this.clickableContentService.set(ClickableSelectableEntities.Audio, audioId, this.content.id);
  }

  playStream(url, id) {
    this.audioService.playStream(url, id).subscribe(() => {
      this.cdr.markForCheck();
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
      this.audioService.playlist = this.content.items;
      this.audioService.currentFile = audio;
      this.playStream(audio.audioPath, audio.fileId);
    }
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

  isFocusToNext(entity: SetFocus) {
    if (entity.status === FocusDirection.Up && this.titleComponent.isFocusedOnTitle) {
      return true;
    }
    if (entity.status === FocusDirection.Down) {
      const index = this.content.items.findIndex((x) => x.fileId === entity.itemId);
      return index === this.content.items.length - 1;
    }
    return false;
  }

  setFocus = (entity?: SetFocus) => {
    const isExist = this.content.items.some((x) => x.fileId === entity.itemId);

    if (entity.status === FocusDirection.Up && isExist) {
      const index = this.content.items.findIndex((x) => x.fileId === entity.itemId);
      if (index === 0) {
        this.titleComponent.focusOnTitle();
        this.clickAudioHandler(null);
      } else {
        this.clickAudioHandler(this.content.items[index - 1].fileId);
        (document.activeElement as HTMLInputElement).blur();
      }
      return;
    }

    if (entity.status === FocusDirection.Up && this.content.items.length > 0) {
      this.clickAudioHandler(this.content.items[this.content.items.length - 1].fileId);
      (document.activeElement as HTMLInputElement).blur();
      return;
    }

    if (entity.status === FocusDirection.Up && this.content.items.length === 0) {
      this.titleComponent.focusOnTitle();
      this.clickAudioHandler(null);
      return;
    }

    if (entity.status === FocusDirection.Down && isExist) {
      const index = this.content.items.findIndex((x) => x.fileId === entity.itemId);
      this.clickAudioHandler(this.content.items[index + 1].fileId);
      (document.activeElement as HTMLInputElement).blur();
      return;
    }

    if (entity.status === FocusDirection.Down) {
      if (this.titleComponent.isFocusedOnTitle) {
        // eslint-disable-next-line prefer-destructuring
        this.clickAudioHandler(this.content.items[0].fileId);
        (document.activeElement as HTMLInputElement).blur();
      } else {
        this.titleComponent.focusOnTitle();
        this.clickAudioHandler(null);
      }
    }
  };

  setFocusToEnd = () => {};

  getEditableNative = () => {
    return null;
  };

  getContent(): AudiosCollection {
    return this.content;
  }

  getContentId(): string {
    return this.content.id;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  mouseEnter = ($event: any) => {
    this.isMouseOver = true;
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  mouseLeave = ($event: any) => {
    this.isMouseOver = false;
  };

  // eslint-disable-next-line class-methods-use-this
  backspaceUp() {}

  // eslint-disable-next-line class-methods-use-this
  backspaceDown() {
    this.checkForDelete();
  }

  deleteDown() {
    this.checkForDelete();
  }
}
