import { Component, Input } from '@angular/core';
import { PhotosCollection } from '../../models/editor-models/photos-collection';

@Component({
  selector: 'app-note-preview-photos',
  templateUrl: './note-preview-photos.component.html',
  styleUrls: ['./note-preview-photos.component.scss'],
})
export class NotePreviewPhotosComponent {
  @Input()
  album: PhotosCollection;
}
