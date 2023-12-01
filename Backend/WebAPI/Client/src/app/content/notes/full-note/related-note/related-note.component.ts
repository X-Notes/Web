import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RelatedNote } from '../../models/related-note.model';
import { Select } from '@ngxs/store';
import { UserStore } from '../../../../core/stateUser/user-state';
import { ThemeENUM } from '../../../../shared/enums/theme.enum';
import { Observable } from 'rxjs';
import { ContentTypeENUM } from 'src/app/editor/entities/contents/content-types.enum';
import { NoteTextTypeENUM } from 'src/app/editor/entities/contents/text-models/note-text-type.enum';
import { ShortUser } from 'src/app/core/models/user/short-user.model';
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

  @Select(UserStore.getUser)
  user$: Observable<ShortUser>;

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
