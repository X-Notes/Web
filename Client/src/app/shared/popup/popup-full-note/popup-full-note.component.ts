import { Component } from '@angular/core';
import { PhotoService } from 'src/app/content/notes/full-note-components/photos-business-logic/photo.service';

@Component({
  selector: 'app-popup-full-note',
  templateUrl: './popup-full-note.component.html',
  styleUrls: ['./popup-full-note.component.scss'],
})
export class PopupFullNoteComponent {
  constructor(public photoService: PhotoService) {}
}
