import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {NotesComponent} from './notes/notes.component';
import { FullNoteComponent } from './full-note/full-note.component';
import { PrivatesComponent } from './privates/privates.component';
import { DeletedComponent } from './deleted/deleted.component';
import { SharedComponent } from './shared/shared.component';
import { ArchiveComponent } from './archive/archive.component';


const itemRoutes: Routes = [
  { path: '', component: PrivatesComponent},
  { path: 'deleted', component: DeletedComponent},
  { path: 'shared', component: SharedComponent},
  { path: 'archive', component: ArchiveComponent},
];

const routes: Routes = [
  { path: '', component: NotesComponent, children: itemRoutes},
  { path: ':id', component: FullNoteComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NoteRouting {
}



