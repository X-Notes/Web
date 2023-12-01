import { Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { NoteComponent } from './note/note.component';
import { NotesService } from './notes.service';

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
}
