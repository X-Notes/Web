import { Component, Input, OnInit } from '@angular/core';
import { AudioService } from '../../audio.service';
import { AudioModel, ContentModel, PlaylistModel } from '../../models/ContentModel';
import { ParentInteraction } from '../../models/ParentInteraction.interface';

@Component({
  selector: 'app-audio-note',
  templateUrl: './audio-note.component.html',
  styleUrls: ['./audio-note.component.scss'],
})
export class AudioNoteComponent implements ParentInteraction, OnInit {
  @Input()
  content: PlaylistModel;

  constructor(private audioService: AudioService) {}

  ngOnInit(): void {}

  playStream(url, id) {
    this.audioService.playStream(url, id).subscribe(() => {
      // listening for fun here
    });
  }

  openFile(audio: AudioModel, index: number) {
    this.audioService.stop();
    if (this.audioService.currentFile?.fileId !== audio.fileId) {
      this.audioService.playlist = this.content.audios;
      this.audioService.currentFile = audio;
      this.playStream(audio.audioPath, audio.fileId);
    }
  }

  pause() {
    this.audioService.pause();
  }

  play(audio: AudioModel, index: number) {
    if (this.audioService.currentFile?.fileId !== audio.fileId) {
      this.openFile(audio, index);
    }
    this.audioService.play();
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
