import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {NotesComponent} from './notes/notes.component';
import { FullNoteComponent } from './full-note/full-note.component';

const routes: Routes = [
  { path: '', component: NotesComponent},
  { path: 'w/:id', component: FullNoteComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NoteRouting {
}



