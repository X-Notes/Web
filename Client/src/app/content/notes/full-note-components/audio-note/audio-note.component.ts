import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AudioService } from '../../audio.service';
import { ExportService } from '../../export.service';
import { AudioModel, ContentModel, PlaylistModel } from '../../models/ContentModel';
import { ParentInteraction } from '../../models/ParentInteraction.interface';
import { RemoveAudioFromPlaylist } from '../../models/removeAudioFromPlaylist';

@Component({
  selector: 'app-audio-note',
  templateUrl: './audio-note.component.html',
  styleUrls: ['./audio-note.component.scss'],
})
export class AudioNoteComponent implements ParentInteraction, OnInit, OnDestroy {
  @Input()
  content: PlaylistModel;

  @Output()
  removePlaylist = new EventEmitter<string>();

  @Output() deleteAudio = new EventEmitter<RemoveAudioFromPlaylist>();

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
