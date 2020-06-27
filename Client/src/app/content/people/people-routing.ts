import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {PeopleComponent} from './people/people.component';

const routes: Routes = [
  { path: '', component: PeopleComponent}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PeopleRouting {
}

