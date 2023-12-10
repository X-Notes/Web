import { Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { NoteComponent } from './note/note.component';
import { NotesService } from './notes.service';
import { Select } from '@ngxs/store';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { Observable } from 'rxjs';
import { PersonalizationSetting } from 'src/app/core/models/personalization-setting.model';

@Component({
  template: '',
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class BaseNotesComponent {
  constructor(public noteService: NotesService) {}

  @ViewChildren(NoteComponent) set viewNoteChildren(elms: QueryList<NoteComponent>) {
    this.noteService.viewElements = elms;
  }

  @ViewChildren('item', { read: ElementRef }) set refElements(elms: QueryList<ElementRef>) {
    this.noteService.muurriElements = elms;
  }

  @Select(UserStore.getPersonalizationSettings)
  public personalization$?: Observable<PersonalizationSetting>;
}
