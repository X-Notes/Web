import { Component, Input, OnInit } from '@angular/core';
import { Album } from '../../models/content-model.model';

@Component({
  selector: 'app-note-preview-photos',
  templateUrl: './note-preview-photos.component.html',
  styleUrls: ['./note-preview-photos.component.scss'],
})
export class NotePreviewPhotosComponent implements OnInit {
  @Input()
  album: Album;

  @Input()
  public userId: string;

  // eslint-disable-next-line class-methods-use-this
  ngOnInit(): void {}
}
