import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublicHeaderComponent } from './components/public-header/public-header.component';
import { PublicNoteComponent } from './public-note.component';
import { SharedModule } from '../shared/shared.module';
import { PublicNoteRouting } from './public-note.routing';
import { PublicNoteContentComponent } from './components/public-note-content/public-note-content.component';
import { FullNoteModule } from '../content/notes/full-note/full-note.module';
import { NoteOwnerComponent } from './components/note-owner/note-owner.component';

@NgModule({
  declarations: [
    PublicHeaderComponent,
    PublicNoteComponent,
    PublicNoteContentComponent,
    NoteOwnerComponent,
  ],
  imports: [CommonModule, SharedModule, PublicNoteRouting, FullNoteModule],
})
export class PublicNoteModule {}
