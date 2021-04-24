import { Component, Input, OnInit } from '@angular/core';
import { VideoModel } from '../../models/ContentMode';
import { ParentInteraction } from '../../models/parent-interaction.interface';

@Component({
  selector: 'app-video-note',
  templateUrl: './video-note.component.html',
  styleUrls: ['./video-note.component.scss'],
})
export class VideoNoteComponent implements OnInit, ParentInteraction {
  @Input()
  content: VideoModel;

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
