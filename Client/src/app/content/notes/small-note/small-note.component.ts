import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { ShortUser } from 'src/app/core/models/short-user.model';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { MurriService } from 'src/app/shared/services/murri.service';
import { ChangeStateRelatedNote } from '../models/change-state-related-note.model';
import { ContentTypeENUM, NoteTextTypeENUM } from '../models/content-model.model';
import { RelatedNote } from '../models/related-note.model';
@Component({
  selector: 'app-small-note',
  templateUrl: './small-note.component.html',
  styleUrls: ['./small-note.component.scss'],
})
export class SmallNoteComponent {
  @Input() note: RelatedNote;

  @Select(UserStore.getUser)
  public user$: Observable<ShortUser>;

  @Output() deleteNote = new EventEmitter<string>();

  @Output() changeState = new EventEmitter<ChangeStateRelatedNote>();

  contentType = ContentTypeENUM;

  textType = NoteTextTypeENUM;

  constructor(public murriService: MurriService) {}

  turnUpSmallNote() {
    this.changeState.emit({ isOpened: !this.note.isOpened, relatedNoteId: this.note.id });
    this.note.isOpened = !this.note.isOpened;
    setTimeout(() => this.murriService.grid.refreshItems().layout(), 100);
  }

  deleteSmallNote() {
    this.deleteNote.emit(this.note.id);
  }
}
