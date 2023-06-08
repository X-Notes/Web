import { Component, Input } from '@angular/core';
import { ContentModelBase } from 'src/app/editor/entities/contents/content-model-base';
import { VideosCollection } from 'src/app/editor/entities/contents/videos-collection';

@Component({
  selector: 'app-note-preview-videos',
  templateUrl: './note-preview-videos.component.html',
  styleUrls: ['./note-preview-videos.component.scss'],
})
export class NotePreviewVideosComponent {

  _content: VideosCollection;

  @Input() set content(value: ContentModelBase) {
    this._content = value as VideosCollection;
  }
}
