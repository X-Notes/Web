import { Component, Input, OnInit } from '@angular/core';
import { AudioModel } from '../../models/ContentMode';
import { ParentInteraction } from '../../models/parent-interaction.interface';

@Component({
  selector: 'app-audio-note',
  templateUrl: './audio-note.component.html',
  styleUrls: ['./audio-note.component.scss'],
})
export class AudioNoteComponent implements OnInit, ParentInteraction {
  @Input()
  content: AudioModel;

  constructor() {}

  setFocus($event?: any) {}

  setFocusToEnd() {}

  updateHTML(content: string) {}

  getNative() {}

  getContent() {
    return this.content;
  }

  mouseEnter($event: any) {}

  mouseOut($event: any) {}

  ngOnInit(): void {}
}
