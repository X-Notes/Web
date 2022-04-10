import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullNotePublicRouting } from './full-note-public-routing';
import { FullNotePublicComponent } from './full-note-public.component';
import { PublicHeaderComponent } from './components/public-header/public-header.component';
import { SharedModule } from '../shared/shared.module';
import { PublicRelatedNotesComponent } from './components/public-related-notes/public-related-notes.component';
import { PublicNoteComponent } from './components/public-note/public-note.component';
import { FullNoteModule } from '../content/notes/full-note/full-note.module';
import { NoteOwnerComponent } from './components/note/note-owner/note-owner.component';

@NgModule({
  declarations: [
    FullNotePublicComponent,
    PublicHeaderComponent,
    PublicRelatedNotesComponent,
    PublicNoteComponent,
    NoteOwnerComponent,
  ],
  imports: [CommonModule, FullNotePublicRouting, FullNoteModule, SharedModule],
})
export class FullNotePublicModule {}
