import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { FullNotePublicComponent } from './full-note-public.component';

const routes: Routes = [
  { path: '', redirectTo: '/about', pathMatch: 'full' },
  { path: ':id', component: FullNotePublicComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FullNotePublicRouting {}
