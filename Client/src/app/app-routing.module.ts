import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NootsComponent } from './noots/noots.component';
import { InvitesComponent } from './invites/invites.component';
import { PeopleComponent } from './people/people.component';
import { LabelsComponent } from './labels/labels.component';
import { NotesComponent } from './notes/notes.component';
import { GroupsComponent } from './groups/groups.component';
import { BinComponent } from './bin/bin.component';


const routes: Routes = [
  {path: '', component: NootsComponent},
  {path: 'noots', component: NootsComponent},
  {path: 'notes', component: NotesComponent},
  {path: 'people', component: PeopleComponent},
  {path: 'groups', component: GroupsComponent},
  {path: 'labels', component: LabelsComponent},
  {path: 'invites', component: InvitesComponent},
  {path: 'bin', component: BinComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
