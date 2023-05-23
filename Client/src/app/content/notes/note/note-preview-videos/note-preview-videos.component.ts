import { Component, Input } from '@angular/core';
import { VideosCollection } from '../../models/editor-models/videos-collection';
import { ContentModelBase } from '../../models/editor-models/content-model-base';

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
