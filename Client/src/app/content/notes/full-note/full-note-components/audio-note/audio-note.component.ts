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
import { AudioService } from '../../../audio.service';
import { ExportService } from '../../../export.service';
import { AudioModel, ContentModel, AudiosCollection } from '../../../models/content-model.model';
import { ParentInteraction } from '../../models/parent-interaction.interface';
import { RemoveAudioFromPlaylist } from '../../../models/remove-audio-from-playlist.model';
import { TypeUploadFormats } from '../../models/enums/type-upload-formats.enum';
import { UploadFileToEntity } from '../../models/upload-files-to-entity';

@Component({
  selector: 'app-audio-note',
  templateUrl: './audio-note.component.html',
  styleUrls: ['./audio-note.component.scss'],
})
export class AudioNoteComponent implements ParentInteraction, OnInit, OnDestroy {

  @ViewChild('uploadAudiosRef') uploadAudiosRef: ElementRef;

  @Output()
  removePlaylist = new EventEmitter<string>();

  @Output()
  changeTitleEvent = new EventEmitter<string>();

  @Output()
  deleteAudio = new EventEmitter<RemoveAudioFromPlaylist>();

  @Output()
  uploadEvent = new EventEmitter<UploadFileToEntity>();

  @Input()
  isReadOnlyMode = false;

  @Input()
  content: AudiosCollection;

  destroy = new Subject<void>();

  formats = TypeUploadFormats.AUDIOS;

  constructor(private audioService: AudioService, private exportService: ExportService) {}

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  ngOnInit() {}

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
    if(files?.length > 0){
      this.uploadEvent.emit({ contentId: this.content.id, files });
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
    this.deleteAudio.emit({
      audioId,
      contentId: this.content.id,
    });
  }

  setFocus = ($event?: any) => {
  };

  setFocusToEnd = () => {};

  updateHTML = (content: string) => {
  };

  getNative = () => {};

  getContent(): ContentModel {
    return this.content;
  }

  mouseEnter = ($event: any) => {
  };

  mouseOut = ($event: any) => {
  };
}
