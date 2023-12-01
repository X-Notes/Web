import { Component, Input } from '@angular/core';
import { ContentModelBase } from 'src/app/editor/entities/contents/content-model-base';
import { PhotosCollection } from 'src/app/editor/entities/contents/photos-collection';

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
