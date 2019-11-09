import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NootsComponent } from './Noots/noots/noots.component';
import { InvitesComponent } from './Invites/invites/invites.component';
import { PeopleComponent } from './People/people/people.component';
import { LabelsComponent } from './Labels/labels/labels.component';
import { NotesComponent } from './Notes/notes/notes.component';
import { GroupsComponent } from './Groups/groups/groups.component';
import { BinComponent } from './Bin/bin/bin.component';


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
