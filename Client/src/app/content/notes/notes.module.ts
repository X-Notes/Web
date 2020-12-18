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
import { FullNoteSliderService } from './full-note-slider.service';
import { MurriService } from 'src/app/shared/services/murri.service';
import { FullNoteContentService } from './full-note-content.service';
import { PhotosComponent } from './full-note-components/photos/photos.component';
import { HtmlComponent } from './full-note-components/html/html.component';
import {QuillModule} from 'ngx-quill';

@NgModule({
  declarations: [
    NotesComponent,
    FullNoteComponent,
    NoteComponent,
    PrivatesComponent,
    SharedComponent,
    DeletedComponent,
    ArchiveComponent,
    PhotosComponent,
    HtmlComponent],
  imports: [
    CommonModule,
    NoteRouting,
    SharedModule,
    QuillModule.forRoot()
  ],
  providers: [{
    provide: HAMMER_GESTURE_CONFIG,
    useClass: MyHammerConfig
  }, FullNoteSliderService, MurriService, FullNoteContentService],
})
export class NotesModule { }
