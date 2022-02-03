import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { ContentActiveteGuard } from 'src/app/core/guards/content-activete.guard';
import { NotesComponent } from './notes/notes.component';
import { PrivatesComponent } from './privates/privates.component';
import { DeletedComponent } from './deleted/deleted.component';
import { SharedComponent } from './shared/shared.component';
import { ArchiveComponent } from './archive/archive.component';

const itemRoutes: Routes = [
  { path: '', component: PrivatesComponent, canActivate: [ContentActiveteGuard] },
  { path: 'deleted', component: DeletedComponent, canActivate: [ContentActiveteGuard] },
  { path: 'shared', component: SharedComponent, canActivate: [ContentActiveteGuard] },
  { path: 'archive', component: ArchiveComponent, canActivate: [ContentActiveteGuard] },
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
