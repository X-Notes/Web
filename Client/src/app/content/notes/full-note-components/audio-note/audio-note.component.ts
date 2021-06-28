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
import { AudioService } from '../../audio.service';
import { ExportService } from '../../export.service';
import { AudioModel, ContentModel, PlaylistModel } from '../../models/content-model.model';
import { ParentInteraction } from '../../models/parent-interaction.interface';
import { RemoveAudioFromPlaylist } from '../../models/remove-audio-from-playlist.model';
import { TypeUploadFormats } from '../../models/type-upload-formats.enum';
import { UploadFileToEntity } from '../../models/upload-files-to-entity';

@Component({
  selector: 'app-audio-note',
  templateUrl: './audio-note.component.html',
  styleUrls: ['./audio-note.component.scss'],
})
export class AudioNoteComponent implements ParentInteraction, OnInit, OnDestroy {
  @Input()
  content: PlaylistModel;

  formats = TypeUploadFormats.AUDIOS;

  @ViewChild('uploadAudiosRef') uploadAudiosRef: ElementRef;

  @Output()
  removePlaylist = new EventEmitter<string>();

  @Output()
  changeTitleEvent = new EventEmitter<string>();

  @Output()
  deleteAudio = new EventEmitter<RemoveAudioFromPlaylist>();

  @Output()
  uploadEvent = new EventEmitter<UploadFileToEntity>();

  destroy = new Subject<void>();

  constructor(private audioService: AudioService, private exportService: ExportService) {}

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  ngOnInit(): void {}

  playStream(url, id) {
    this.audioService.playStream(url, id).subscribe(() => {
      // TODO listening for fun here
    });
  }

  uploadHandler = () => {
    this.uploadAudiosRef.nativeElement.click();
  };

  async uploadAudios(event) {
    const data = new FormData();
    const { files } = event.target;
    for (const file of files) {
      data.append('audios', file);
    }
    this.uploadEvent.emit({ id: this.content.id, formData: data });
  }

  openFile(audio: AudioModel) {
    this.audioService.stop();
    if (this.audioService.currentFile?.fileId !== audio.fileId) {
      this.audioService.playlist = this.content.audios;
      this.audioService.currentFile = audio;
      this.playStream(audio.audioPath, audio.fileId);
    }
  }

  async exportPlaylist(playlist: PlaylistModel) {
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
    console.log($event);
  };

  setFocusToEnd = () => {};

  updateHTML = (content: string) => {
    console.log(content);
  };

  getNative = () => {};

  getContent(): ContentModel {
    return this.content;
  }

  mouseEnter = ($event: any) => {
    console.log($event);
  };

  mouseOut = ($event: any) => {
    console.log($event);
  };
}
