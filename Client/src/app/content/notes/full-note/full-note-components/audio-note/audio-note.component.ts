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
import { AudioService } from '../../../audio.service';
import { ExportService } from '../../../export.service';
import { AudioModel, ContentModel, AudiosCollection } from '../../../models/content-model.model';
import { ParentInteraction } from '../../models/parent-interaction.interface';
import { TypeUploadFormats } from '../../models/enums/type-upload-formats.enum';
import { UploadFileToEntity } from '../../models/upload-files-to-entity';
import {
  ClickableContentService,
  ClickableSelectableEntities,
} from '../../content-editor-services/clickable-content.service';
import { ThemeENUM } from 'src/app/shared/enums/theme.enum';

@Component({
  selector: 'app-audio-note',
  templateUrl: './audio-note.component.html',
  styleUrls: ['./audio-note.component.scss'],
})
export class AudioNoteComponent implements ParentInteraction, OnInit, OnDestroy {
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
  
  themeE = ThemeENUM;
  
  @Input()
  content: AudiosCollection;

  destroy = new Subject<void>();

  formats = TypeUploadFormats.audios;

  namePlaylistChanged: Subject<string> = new Subject<string>();

  constructor(
    private audioService: AudioService,
    private exportService: ExportService,
    private clickableContentService: ClickableContentService,
    private host: ElementRef
  ) {}

  getHost(){
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

  clickAudioHandler(audio: AudioModel) {
    this.clickableContentService.set(
      ClickableSelectableEntities.Audio,
      audio.fileId,
      this.content.id,
    );
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

  setFocus = ($event?: any) => {};

  setFocusToEnd = () => {};

  updateHTML = (content: string) => {};

  getEditableNative = () => {};

  getContent(): ContentModel {
    return this.content;
  }

  mouseEnter = ($event: any) => {};

  mouseOut = ($event: any) => {};

  onInput($event) {
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
    const audioId = this.clickableContentService.id;
    if (
      this.clickableContentService.collectionId === this.content.id &&
      this.content.audios.some((x) => x.fileId === audioId)
    ) {
      this.deleteAudioEvent.emit(audioId);
    }
  }
}
