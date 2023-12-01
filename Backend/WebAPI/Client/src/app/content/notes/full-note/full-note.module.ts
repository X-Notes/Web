import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { FullNoteComponent } from './full-note.component';
import { NoteSnapshotComponent } from './note-snapshot/note-snapshot.component';
import { FullNoteRouting } from './full-note-routing';
import { RightSectionContentComponent } from './right-section-content/right-section-content.component';
import { LeftSectionContentNotesListComponent } from './left-section-content-notes-list/left-section-content-notes-list.component';
import { EditorModule } from 'src/app/editor/editor.module';

@NgModule({
  declarations: [
    FullNoteComponent,
    NoteSnapshotComponent,
    RightSectionContentComponent,
    LeftSectionContentNotesListComponent,
  ],
  exports: [
    LeftSectionContentNotesListComponent,
    RightSectionContentComponent,
  ],
  providers: [],
  imports: [CommonModule, SharedModule, EditorModule, FullNoteRouting],
})
export class FullNoteModule {}
