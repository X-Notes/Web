import { Component, Input } from '@angular/core';
import { BaseCollection } from '../../models/editor-models/base-collection';
import { VideoModel } from '../../models/editor-models/videos-collection';

@Component({
  selector: 'app-note-preview-videos',
  templateUrl: './note-preview-videos.component.html',
  styleUrls: ['./note-preview-videos.component.scss'],
})
export class NotePreviewVideosComponent {
  @Input()
  content: BaseCollection<VideoModel>;
}
