import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {FoldersComponent} from './folders/folders.component';
import { ContentActiveteGuard } from 'src/app/core/guards/content-activete.guard';

const routes: Routes = [
  { path: '', component: FoldersComponent, canActivate: [ContentActiveteGuard]}, ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FoldersRouting {
}

