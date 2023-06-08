import { Component, Input } from '@angular/core';
import { ThemeENUM } from '../../../../../shared/enums/theme.enum';
import { BaseText } from 'src/app/editor/entities/contents/base-text';
import { NoteTextTypeENUM } from 'src/app/editor/entities/contents/text-models/note-text-type.enum';

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

  get dotColor(): string {
    return this.activeTheme === ThemeENUM.Dark ? 'white' : 'black';
  }
}
