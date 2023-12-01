import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { PageComponent } from './page/page.component';
import { EntityType } from '../shared/enums/entity-types.enum';

const routes: Routes = [{ path: '', component: PageComponent, data: { route_key: EntityType.Incorrect } }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ErrorRouting {}
