import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { LabelsComponent } from './labels/labels.component';
import { AllComponent } from './all/all.component';
import { DeletedComponent } from './deleted/deleted.component';
import { EntityType } from 'src/app/shared/enums/entity-types.enum';

const itemRoutes: Routes = [
  { path: '', component: AllComponent, data: { route_key: EntityType.LabelPrivate } },
  { path: 'deleted', component: DeletedComponent, data: { route_key: EntityType.LabelDeleted } },
];

const routes: Routes = [{ path: '', component: LabelsComponent, children: itemRoutes }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LabelsRouting {}
