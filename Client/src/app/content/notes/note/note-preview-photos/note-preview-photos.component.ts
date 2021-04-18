import { Component, Input, OnInit } from '@angular/core';
import { Album } from '../../models/ContentMode';

@Component({
  selector: 'app-note-preview-photos',
  templateUrl: './note-preview-photos.component.html',
  styleUrls: ['./note-preview-photos.component.scss'],
})
export class NotePreviewPhotosComponent implements OnInit {
  @Input()
  album: Album;

  // eslint-disable-next-line class-methods-use-this
  ngOnInit(): void {}
}
