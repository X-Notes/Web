import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-note-collection-title',
  templateUrl: './note-collection-title.component.html',
  styleUrls: ['./note-collection-title.component.scss'],
})
export class NoteCollectionTitleComponent {
  @Input()
  name?: string;
}
