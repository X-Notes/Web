import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { NotesComponent } from './notes/notes.component';
import { PrivatesComponent } from './privates/privates.component';
import { DeletedComponent } from './deleted/deleted.component';
import { SharedComponent } from './shared/shared.component';
import { ArchiveComponent } from './archive/archive.component';
import { EntityType } from 'src/app/shared/enums/entity-types.enum';

const itemRoutes: Routes = [
  { path: '', component: PrivatesComponent, data: { route_key: EntityType.NotePrivate } },
  { path: 'deleted', component: DeletedComponent, data: { route_key: EntityType.NoteDeleted } },
  { path: 'shared', component: SharedComponent, data: { route_key: EntityType.NoteShared } },
  { path: 'archive', component: ArchiveComponent, data: { route_key: EntityType.NoteArchive } },
];

const routes: Routes = [
  { path: '', component: NotesComponent, children: itemRoutes },
  {
    path: ':id',
    loadChildren: () => import('./full-note/full-note.module').then((m) => m.FullNoteModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NoteRouting {}
