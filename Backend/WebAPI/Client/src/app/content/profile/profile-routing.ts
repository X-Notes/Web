import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { ProfileComponent } from './profile/profile.component';
import { EntityType } from 'src/app/shared/enums/entity-types.enum';

const routes: Routes = [{ path: '', component: ProfileComponent, data: { route_key: EntityType.Profile } }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProfileRouting {}
