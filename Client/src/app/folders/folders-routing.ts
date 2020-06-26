import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {FoldersComponent} from './folders/folders.component';

const routes: Routes = [
  { path: '', component: FoldersComponent}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FoldersRouting {
}

