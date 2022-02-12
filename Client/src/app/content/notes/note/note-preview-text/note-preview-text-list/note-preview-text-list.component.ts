import { Component, Input } from '@angular/core';
import { BaseText, NoteTextTypeENUM } from '../../../models/editor-models/base-text';

@Component({
  selector: 'app-note-preview-text-list',
  templateUrl: './note-preview-text-list.component.html',
  styleUrls: ['./note-preview-text-list.component.scss'],
})
export class NotePreviewTextListComponent {
  @Input()
  html: string;

  @Input()
  contentBase: BaseText;

  listType = NoteTextTypeENUM;
}
