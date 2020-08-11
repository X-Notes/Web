import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {LabelsComponent} from './labels/labels.component';
import { AllComponent } from './all/all.component';
import { DeletedComponent } from './deleted/deleted.component';
import { ContentActiveteGuard } from 'src/app/core/guards/content-activete.guard';

const itemRoutes: Routes = [
  { path: '', component: AllComponent, canActivate: [ContentActiveteGuard]},
  { path: 'deleted', component: DeletedComponent, canActivate: [ContentActiveteGuard]},
];

const routes: Routes = [
  { path: '', component: LabelsComponent, children: itemRoutes}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LabelsRouting {
}

