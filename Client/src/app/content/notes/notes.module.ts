import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { MyHammerConfig } from 'src/app/shared/hammer.config';
import { MurriService } from 'src/app/shared/services/murri.service';
import { NotesComponent } from './notes/notes.component';
import { NoteRouting } from './notes-routing';
import { PrivatesComponent } from './privates/privates.component';
import { SharedComponent } from './shared/shared.component';
import { DeletedComponent } from './deleted/deleted.component';
import { ArchiveComponent } from './archive/archive.component';
import { FullNoteModule } from './full-note/full-note.module';

@NgModule({
  declarations: [
    NotesComponent,
    PrivatesComponent,
    SharedComponent,
    DeletedComponent,
    ArchiveComponent,
  ],
  imports: [CommonModule, NoteRouting, SharedModule, FullNoteModule],
  providers: [
    {
      provide: HAMMER_GESTURE_CONFIG,
      useClass: MyHammerConfig,
    },
    MurriService,
  ],
})
export class NotesModule {}
