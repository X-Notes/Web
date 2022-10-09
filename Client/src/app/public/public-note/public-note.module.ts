import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublicNoteComponent } from './public-note.component';
import { SharedModule } from '../../shared/shared.module';
import { PublicNoteRouting } from './public-note.routing';
import { PublicNoteContentComponent } from './components/public-note-content/public-note-content.component';
import { FullNoteModule } from '../../content/notes/full-note/full-note.module';
import { SharedPublicModule } from '../shared-public/shared-public/shared-public.module';

@NgModule({
  declarations: [PublicNoteComponent, PublicNoteContentComponent],
  imports: [CommonModule, SharedModule, PublicNoteRouting, FullNoteModule, SharedPublicModule],
})
export class PublicNoteModule {}
