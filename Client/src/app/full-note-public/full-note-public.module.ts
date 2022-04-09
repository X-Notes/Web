import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullNotePublicRouting } from './full-note-public-routing';
import { FullNotePublicComponent } from './full-note-public.component';
import { PublicHeaderComponent } from './components/public-header/public-header.component';
import { SharedModule } from '../shared/shared.module';
import { PublicRelatedNotesComponent } from './components/public-related-notes/public-related-notes.component';

@NgModule({
  declarations: [FullNotePublicComponent, PublicHeaderComponent, PublicRelatedNotesComponent],
  imports: [CommonModule, FullNotePublicRouting, SharedModule],
})
export class FullNotePublicModule {}
