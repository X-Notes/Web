import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {NotesComponent} from './notes/notes.component';


@NgModule({
  declarations: [NotesComponent],
  imports: [
    CommonModule
  ],
  exports: [NotesComponent]
})
export class NotesModule { }
