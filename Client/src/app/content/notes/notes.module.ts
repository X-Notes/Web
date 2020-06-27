import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotesComponent } from './notes/notes.component';
import { NoteRouting } from './notes-routing';



@NgModule({
  declarations: [NotesComponent],
  imports: [
    CommonModule,
    NoteRouting
  ]
})
export class NotesModule { }
