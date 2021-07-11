import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { VideoModel } from '../../models/content-model.model';
import { ParentInteraction } from '../../models/parent-interaction.interface';
import { NoteStore } from '../../state/notes-state';

@Component({
  selector: 'app-video-note',
  templateUrl: './video-note.component.html',
  styleUrls: ['./video-note.component.scss'],
})
export class VideoNoteComponent implements ParentInteraction {
  @Input()
  content: VideoModel;

  @Select(NoteStore.authorId)
  public id$: Observable<string>;

  @Output() deleteVideoEvent = new EventEmitter<string>();

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
