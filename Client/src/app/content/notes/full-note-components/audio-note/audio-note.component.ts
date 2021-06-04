import { Component, Input, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AudioService } from '../../audio.service';
import { AudioModel } from '../../models/ContentMode';
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
        url: `${environment.writeAPI}/api/Files/audio/${this.content.fileId}`,
        id: this.content.fileId,
        name: this.content.name,
      });
      this.audioService.playlist = this.files;
    }
  }

  setFocus = ($event?: any) => {
    console.log($event);
  };

  setFocusToEnd = () => {};

  updateHTML = (content: string) => {
    console.log(content);
  };

  getNative = () => {};

  getContent() {
    return this.content;
  }

  mouseEnter = ($event: any) => {
    console.log($event);
  };

  mouseOut = ($event: any) => {
    console.log($event);
  };
}
