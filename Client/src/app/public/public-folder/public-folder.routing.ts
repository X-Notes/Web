import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { PublicFolderComponent } from './public-folder.component';
import { HandleAuthorizedUserGuard } from '../guards/handle-authorized-user.guard';

const routes: Routes = [
  { path: '', redirectTo: '/about', pathMatch: 'full' },
  { path: ':id', component: PublicFolderComponent, canActivate: [HandleAuthorizedUserGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PublicFolderRouting {}
