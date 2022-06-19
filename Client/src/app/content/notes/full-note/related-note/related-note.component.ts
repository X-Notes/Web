import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ContentTypeENUM } from '../../models/editor-models/content-types.enum';
import { RelatedNote } from '../../models/related-note.model';
import { NoteTextTypeENUM } from '../../models/editor-models/base-text';
import { Select } from '@ngxs/store';
import { UserStore } from '../../../../core/stateUser/user-state';
import { ThemeENUM } from '../../../../shared/enums/theme.enum';
import { Observable } from 'rxjs';
@Component({
  selector: 'app-related-note',
  templateUrl: './related-note.component.html',
  styleUrls: ['./related-note.component.scss'],
  providers: [],
})
export class RelatedNoteComponent {
  @Input() note: RelatedNote;

  @Input() isCanEdit: boolean;

  @Output() deleteNote = new EventEmitter<string>();

  @Output() changeState = new EventEmitter<RelatedNote>();

  @Select(UserStore.getUserTheme)
  theme$: Observable<ThemeENUM>;

  contentType = ContentTypeENUM;

  textType = NoteTextTypeENUM;

  turnUpSmallNote() {
    this.note.isOpened = !this.note.isOpened;
    this.changeState.emit(this.note);
  }

  deleteSmallNote() {
    this.deleteNote.emit(this.note.id);
  }
}
