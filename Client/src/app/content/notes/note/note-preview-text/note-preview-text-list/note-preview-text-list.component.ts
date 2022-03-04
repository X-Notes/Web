import { Component, Input } from '@angular/core';
import { ThemeENUM } from '../../../../../shared/enums/theme.enum';
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

  @Input()
  activeTheme: ThemeENUM = ThemeENUM.Light;

  listType = NoteTextTypeENUM;

  get dotColor() {
    return this.activeTheme === ThemeENUM.Dark ? 'white' : 'black';
  }
}