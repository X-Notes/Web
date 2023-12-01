import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { FullNoteComponent } from './full-note.component';
import { NoteSnapshotComponent } from './note-snapshot/note-snapshot.component';
import { EntityType } from 'src/app/shared/enums/entity-types.enum';

const routes: Routes = [
  { path: '', component: FullNoteComponent, data: { route_key: EntityType.NoteInner } },
  { path: 'history/:snapshotId', component: NoteSnapshotComponent, data: { route_key: EntityType.History } },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FullNoteRouting {}
