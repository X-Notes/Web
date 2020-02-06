import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AllNotesComponent } from './all-notes/all-notes.component';
import { SharedNotesComponent } from './shared-notes/shared-notes.component';
import { LockedNotesComponent } from './locked-notes/locked-notes.component';
import { NoteComponent } from './note/note.component';
import { NotesContainerComponent } from './notes-container/notes-container.component';
import { AppRoutingModule } from '..//app-routing.module';

@NgModule({
  declarations: [AllNotesComponent, SharedNotesComponent, LockedNotesComponent, NoteComponent, NotesContainerComponent],
  imports: [
    CommonModule,
    AppRoutingModule
  ],
  exports: []
})
export class NotesModule { }
