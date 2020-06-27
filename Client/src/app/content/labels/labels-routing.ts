import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {LabelsComponent} from './labels/labels.component';

const routes: Routes = [
  { path: '', component: LabelsComponent}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LabelsRouting {
}

