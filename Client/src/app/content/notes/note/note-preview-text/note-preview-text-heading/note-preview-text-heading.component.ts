import { Component, Input } from '@angular/core';
import { HeadingTypeENUM } from '../../../models/editor-models/text-models/heading-type.enum';

@Component({
  selector: 'app-note-preview-text-heading',
  templateUrl: './note-preview-text-heading.component.html',
  styleUrls: ['./note-preview-text-heading.component.scss'],
})
export class NotePreviewTextHeadingComponent {
  @Input()
  html: string;

  @Input()
  type: HeadingTypeENUM;
}
