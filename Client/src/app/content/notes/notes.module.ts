import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotesComponent } from './notes/notes.component';
import { NoteRouting } from './notes-routing';
import { SharedModule } from 'src/app/shared/shared.module';



@NgModule({
  declarations: [NotesComponent],
  imports: [
    CommonModule,
    NoteRouting,
    SharedModule
  ]
})
export class NotesModule { }
