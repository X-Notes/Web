import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { AboutComponent } from './about/about.component';
import { EntityType } from '../shared/enums/entity-types.enum';

const routes: Routes = [{ path: '', component: AboutComponent, data: { route_key: EntityType.About } }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AboutRouting {}
