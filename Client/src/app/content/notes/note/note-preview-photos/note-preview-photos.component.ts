import { Component, Input } from '@angular/core';
import { PhotosCollection } from '../../models/editor-models/photos-collection';
import { ContentModelBase } from '../../models/editor-models/content-model-base';

@Component({
  selector: 'app-note-preview-photos',
  templateUrl: './note-preview-photos.component.html',
  styleUrls: ['./note-preview-photos.component.scss'],
})
export class NotePreviewPhotosComponent {
  _content: PhotosCollection;

  @Input() set content(value: ContentModelBase) {
    this._content = value as PhotosCollection;
  }
}
