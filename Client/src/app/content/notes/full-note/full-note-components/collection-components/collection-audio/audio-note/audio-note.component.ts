import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
} from '@angular/core';
import { AudioService } from '../../../../../audio.service';
import { ExportService } from '../../../../../export.service';
import { ParentInteractionCollection } from '../../../../models/parent-interaction.interface';
import { TypeUploadFormats } from '../../../../models/enums/type-upload-formats.enum';
import { FocusDirection, SetFocus } from '../../../../models/set-focus';
import { CollectionBaseComponent } from '../../collection.base.component';
import { ClickableSelectableEntities } from '../../../../content-editor-services/models/clickable-selectable-entities.enum';
import {
  AudioModel,
  AudiosCollection,
} from 'src/app/content/notes/models/editor-models/audios-collection';
import { HtmlComponentsFacadeService } from '../../../html-components-services/html-components.facade.service';

@Component({
  selector: 'app-audio-note',
  templateUrl: './audio-note.component.html',
  styleUrls: ['./audio-note.component.scss', '../../../../../../../../styles/innerNote.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AudioNoteComponent
  extends CollectionBaseComponent<AudiosCollection>
  implements ParentInteractionCollection, OnInit
{
  formats = TypeUploadFormats.audios;

  constructor(
    private audioService: AudioService,
    private exportService: ExportService,
    private host: ElementRef,
    cdr: ChangeDetectorRef,
    facade: HtmlComponentsFacadeService,
  ) {
    super(cdr, ClickableSelectableEntities.Audio, facade);
  }

  ngOnInit(): void {}

  getHost() {
    return this.host;
  }

  openFile(audio: AudioModel) {
    if (this.audioService.currentFile?.fileId !== audio.fileId) {
      this.audioService.playlist = this.content.items;
      this.audioService.currentFile = audio;
      this.audioService.runAudio(audio.audioPath, audio.fileId);
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
    entity.event.preventDefault();

    const isExist = this.content.items.some((x) => x.fileId === entity.itemId);
    if (entity.status === FocusDirection.Up && isExist) {
      const index = this.content.items.findIndex((x) => x.fileId === entity.itemId);
      if (index === 0) {
        this.scrollAndFocusToTitle();
      } else {
        this.clickItemHandler(this.content.items[index - 1].fileId);
        (document.activeElement as HTMLInputElement).blur();
      }
      this.cdr.detectChanges();
      return;
    }

    if (entity.status === FocusDirection.Up && this.content.items.length > 0) {
      this.clickItemHandler(this.content.items[this.content.items.length - 1].fileId);
      (document.activeElement as HTMLInputElement).blur();
      this.cdr.detectChanges();
      return;
    }

    if (entity.status === FocusDirection.Up && this.content.items.length === 0) {
      this.scrollAndFocusToTitle();
      this.cdr.detectChanges();
      return;
    }

    if (entity.status === FocusDirection.Down && isExist) {
      const index = this.content.items.findIndex((x) => x.fileId === entity.itemId);
      this.clickItemHandler(this.content.items[index + 1].fileId);
      (document.activeElement as HTMLInputElement).blur();
      this.cdr.detectChanges();
      return;
    }

    if (entity.status === FocusDirection.Down) {
      if (this.titleComponent.isFocusedOnTitle) {
        // eslint-disable-next-line prefer-destructuring
        this.clickItemHandler(this.content.items[0].fileId);
        (document.activeElement as HTMLInputElement).blur();
      } else {
        this.scrollAndFocusToTitle();
      }
      this.cdr.detectChanges();
      return;
    }
  };

  setFocusToEnd = () => {};

  getEditableNative = () => {
    return null;
  };

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
