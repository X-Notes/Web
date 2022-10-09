import { Component, Input } from '@angular/core';
import { ShortUserPublic } from '../../interfaces/short-user-public.model';

@Component({
  selector: 'app-note-owner',
  templateUrl: './note-owner.component.html',
  styleUrls: ['./note-owner.component.scss'],
})
export class NoteOwnerComponent {
  @Input() owner: ShortUserPublic | undefined;
}
