import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {NotesComponent} from './notes/notes.component';

const routes: Routes = [
  { path: '', component: NotesComponent}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NoteRouting {
}



