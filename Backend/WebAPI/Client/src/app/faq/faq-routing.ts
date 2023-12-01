import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { FaqComponent } from './faq.component';
import { EntityType } from '../shared/enums/entity-types.enum';

const routes: Routes = [{ path: '', component: FaqComponent, data: { route_key: EntityType.FAQ } }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FaqRouting {}
