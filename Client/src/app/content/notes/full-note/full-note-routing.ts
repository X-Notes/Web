import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { FullNoteComponent } from './full-note.component';
import { NoteSnapshotComponent } from './note-snapshot/note-snapshot.component';

const routes: Routes = [
  { path: '', component: FullNoteComponent },
  { path: 'history/:snapshotId', component: NoteSnapshotComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FullNoteRouting {}
