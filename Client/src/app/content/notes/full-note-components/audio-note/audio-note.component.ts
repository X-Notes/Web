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
    console.log(this.files[0]);
    this.audioService.getState().subscribe((state) => {
      this.state = state;
    });
    this.openFile(this.files[0], 0);
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

  openFile(file, index) {
    this.currentFile = { index, file };
    this.audioService.stop();
    this.playStream(file);
  }

  pause() {
    this.audioService.pause();
  }

  play() {
    this.audioService.play();
  }

  stop() {
    this.audioService.stop();
  }

  loop() {
    this.audioService.loop();
  }

  next() {
    const index = this.currentFile.index + 1;
    const file = this.files[index];
    this.openFile(file, index);
  }

  previous() {
    const index = this.currentFile.index - 1;
    const file = this.files[index];
    this.openFile(file, index);
  }

  isFirstPlaying() {
    return this.currentFile.index === 0;
  }

  isLastPlaying() {
    return this.currentFile.index === this.files.length - 1;
  }

  onSliderChangeEnd(change) {
    this.audioService.seekTo(change.value);
  }

  onSliderVolumeChangeEnd(change) {
    this.audioService.seekToVolume(change.value);
  }
}
