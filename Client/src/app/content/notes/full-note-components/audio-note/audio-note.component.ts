import { Component, Input, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AudioService } from '../../audio.service';
import { AudioModel, ContentModel } from '../../models/ContentModel';
import { ParentInteraction } from '../../models/parent-interaction.interface';

@Component({
  selector: 'app-audio-note',
  templateUrl: './audio-note.component.html',
  styleUrls: ['./audio-note.component.scss'],
})
export class AudioNoteComponent implements ParentInteraction, OnInit {
  @Input()
  content: AudioModel;

  files: Array<any> = [];

  constructor(private audioService: AudioService) {}

  ngOnInit(): void {
    if (this.content.fileId) {
      this.files.push({
        // TODO REMOVE THIS WHEN PLAYLIST WILL BEEN DONE IN BE
        url: `${environment.writeAPI}/api/Files/audio/${this.content.fileId}`,
        id: this.content.fileId,
        name: this.content.name,
      });
    }
  }

  playStream(url, id) {
    this.audioService.playStream(url, id).subscribe(() => {
      // listening for fun here
    });
  }

  openFile(audio: AudioModel, index: number) {
    this.audioService.stop();
    if (this.audioService.currentFile?.audio?.id !== audio.id) {
      this.audioService.playlist = this.files;
      this.audioService.currentFile = { audio, index };
      this.playStream(audio.audioPath, audio.id);
    }
  }

  pause() {
    this.audioService.pause();
  }

  play(audio: AudioModel, index: number) {
    if (this.audioService.currentFile?.audio?.id !== audio.id) {
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
