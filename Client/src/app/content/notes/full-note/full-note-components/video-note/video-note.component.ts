import { Component, EventEmitter, Input, Output } from '@angular/core';
import { VideosCollection } from '../../../models/content-model.model';
import { ParentInteraction } from '../../models/parent-interaction.interface';

@Component({
  selector: 'app-video-note',
  templateUrl: './video-note.component.html',
  styleUrls: ['./video-note.component.scss'],
})
export class VideoNoteComponent implements ParentInteraction {
  @Input()
  content: VideosCollection;

  @Input()
  isReadOnlyMode = false;

  @Output() deleteVideoEvent = new EventEmitter<string>();

  setFocus = ($event?: any) => {};

  setFocusToEnd = () => {};

  updateHTML = (content: string) => {};

  getNative = () => {};

  getContent() {
    return this.content;
  }

  get isEmpty(): boolean {
    if (!this.content.videos || this.content.videos.length === 0) {
      return true;
    }
    return false;
  }

  get getFirst() {
    if (this.content.videos && this.content.videos.length > 0) {
      return this.content.videos[0];
    }
  }

  mouseEnter = ($event: any) => {};

  mouseOut = ($event: any) => {};
}
