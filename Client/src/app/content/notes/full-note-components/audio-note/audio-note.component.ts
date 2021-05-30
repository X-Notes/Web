import { Component, Input, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AudioService } from '../../audio.service';
import { AudioModel } from '../../models/ContentMode';
import { ParentInteraction } from '../../models/parent-interaction.interface';
import { StreamAudioState } from '../../models/StreamAudioState';

@Component({
  selector: 'app-audio-note',
  templateUrl: './audio-note.component.html',
  styleUrls: ['./audio-note.component.scss'],
})
export class AudioNoteComponent implements ParentInteraction, OnInit {
  @Input()
  content: AudioModel;

  files: Array<any> = [];

  state: StreamAudioState;

  currentFile: any = {};

  constructor(private audioService: AudioService) {}

  ngOnInit(): void {
    if (this.content.fileId) {
      this.files.push(`${environment.writeAPI}/api/Files/audio/${this.content.fileId}`);
    }
    this.audioService.getState().subscribe((state) => {
      this.state = state;
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

  getContent() {
    return this.content;
  }

  mouseEnter = ($event: any) => {
    console.log($event);
  };

  mouseOut = ($event: any) => {
    console.log($event);
  };

  playStream(url) {
    this.audioService.playStream(url).subscribe(() => {
      // listening for fun here
    });
  }

  openFile(id, index) {
    this.currentFile = { index, id };
    this.audioService.stop();
    this.playStream(this.files[index]);
  }

  pause() {
    this.audioService.pause();
  }

  play() {
    this.audioService.play();
  }
}
