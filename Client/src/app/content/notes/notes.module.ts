import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotesComponent } from './notes/notes.component';
import { NoteRouting } from './notes-routing';
import { SharedModule } from 'src/app/shared/shared.module';
import { FullNoteComponent } from './full-note/full-note.component';
import { NoteComponent } from './note/note.component';
import { PrivatesComponent } from './privates/privates.component';
import { SharedComponent } from './shared/shared.component';
import { DeletedComponent } from './deleted/deleted.component';
import { ArchiveComponent } from './archive/archive.component';
import { HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { MyHammerConfig } from 'src/app/shared/hammer.config';
import { NotesService } from './notes.service';
import { FullNoteSliderService } from './full-note-slider.service';


@NgModule({
  declarations: [
    NotesComponent,
    FullNoteComponent,
    NoteComponent,
    PrivatesComponent,
    SharedComponent,
    DeletedComponent,
    ArchiveComponent],
  imports: [
    CommonModule,
    NoteRouting,
    SharedModule
  ],
  providers: [{
    provide: HAMMER_GESTURE_CONFIG,
    useClass: MyHammerConfig
  }, NotesService, FullNoteSliderService],
})
export class NotesModule { }
