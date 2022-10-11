import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { PublicNoteComponent } from './public-note.component';
import { HandleAuthorizedUserGuard } from '../guards/handle-authorized-user.guard';

const routes: Routes = [
  { path: '', redirectTo: '/about', pathMatch: 'full' },
  { path: ':id', component: PublicNoteComponent, canActivate: [HandleAuthorizedUserGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PublicNoteRouting {}
