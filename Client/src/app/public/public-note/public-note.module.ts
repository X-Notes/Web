import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublicNoteComponent } from './public-note.component';
import { SharedModule } from '../../shared/shared.module';
import { PublicNoteRouting } from './public-note.routing';
import { PublicNoteContentComponent } from './components/public-note-content/public-note-content.component';
import { SharedPublicModule } from '../shared-public/shared-public/shared-public.module';
import { EditorModule } from 'src/app/editor/editor.module';
import { MurriService } from 'src/app/shared/services/murri.service';

@NgModule({
  declarations: [PublicNoteComponent, PublicNoteContentComponent],
  imports: [CommonModule, SharedModule, PublicNoteRouting, EditorModule, SharedPublicModule],
  providers: [MurriService],
})
export class PublicNoteModule {}
