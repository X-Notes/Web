import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AllNotesComponent } from './all-notes/all-notes.component';
import { SharedNotesComponent } from './shared-notes/shared-notes.component';
import { LockedNotesComponent } from './locked-notes/locked-notes.component';
import { NoteComponent } from './note/note.component';
import { NewNoteComponent } from './new-note/new-note.component';


@NgModule({
  declarations: [AllNotesComponent, SharedNotesComponent, LockedNotesComponent, NoteComponent, NewNoteComponent],
  imports: [
    CommonModule
  ],
  exports: []
})
export class NotesModule { }
