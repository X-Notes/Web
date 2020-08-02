import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotesComponent } from './notes/notes.component';
import { NoteRouting } from './notes-routing';
import { SharedModule } from 'src/app/shared/shared.module';
import { FullNoteComponent } from './full-note/full-note.component';
import { NoteComponent } from './note/note.component';
import { ReplacePipe } from './pipes/replace.pipe';


@NgModule({
  declarations: [NotesComponent, FullNoteComponent, NoteComponent, ReplacePipe],
  imports: [
    CommonModule,
    NoteRouting,
    SharedModule
  ]
})
export class NotesModule { }
