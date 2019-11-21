import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InvitesComponent } from './Invites/invites/invites.component';
import { PeopleComponent } from './People/people/people.component';
import { LabelsComponent } from './Labels/labels/labels.component';
import { GroupsComponent } from './Groups/groups/groups.component';
import { BinComponent } from './Bin/bin/bin.component';
import {LandingComponent} from './landing/landing.component';
import {MyNootsComponent} from './Noots/my-noots/my-noots.component';
import {SavedComponent} from './Noots/saved/saved.component';
import {WatchLatersComponent} from './Noots/watch-laters/watch-laters.component';
import {MainComponent} from './main/main.component';
import {AllNootsComponent} from './Noots/all-noots/all-noots.component';
import {FiltersNootsComponent} from './Noots/filters-noots/filters-noots.component';
import {AllNotesComponent} from './Notes/all-notes/all-notes.component';
import {SharedNotesComponent} from './Notes/shared-notes/shared-notes.component';
import { LockedNotesComponent} from './Notes/locked-notes/locked-notes.component';
import { SubscribesComponent } from './Noots/Subscribe-folder/subscribes/subscribes.component';
import {NewNootComponent} from './Noots/new-noot/new-noot.component';
import {NewNoteComponent} from './Notes/new-note/new-note.component';
import { AuthGuard } from './Guards/auth.guard';
import { NootsContainerComponent} from './Noots/noots-container/noots-container.component';
import { NotesContainerComponent} from './Notes/notes-container/notes-container.component';


const ChildNootsRoutes: Routes = [
  { path: '', component: AllNootsComponent},
  { path: 'all', component: AllNootsComponent},
  { path: 'my', component: MyNootsComponent},
  { path: 'saved', component: SavedComponent},
  { path: 'watch-laters', component: WatchLatersComponent},
  { path: 'filters', component: FiltersNootsComponent},
  { path: 'subscribes' , component: SubscribesComponent},
  { path: 'new', component: NewNootComponent}
];
const ChildNotesRoutes: Routes = [
  { path: '', component: AllNotesComponent},
  { path: 'all', component: AllNotesComponent},
  { path: 'shared', component: SharedNotesComponent},
  { path: 'locked', component: LockedNotesComponent},
  { path: 'new', component: NewNoteComponent}
];

const Routes: Routes =
[
  {path: 'noots', component: NootsContainerComponent, children: ChildNootsRoutes, canActivate: [AuthGuard]},
  {path: 'notes', component: NotesContainerComponent, children: ChildNotesRoutes, canActivate: [AuthGuard]},
  {path: 'people', component: PeopleComponent, canActivate: [AuthGuard]},
  {path: 'groups', component: GroupsComponent, canActivate: [AuthGuard]},
  {path: 'invites', component: InvitesComponent, canActivate: [AuthGuard]},
  {path: 'labels', component: LabelsComponent, canActivate: [AuthGuard]},
  {path: 'bin', component: BinComponent, canActivate: [AuthGuard]}
];

const routes: Routes = [

  {path: 'about', component: LandingComponent},
  {path: '', component: MainComponent, children: Routes, canActivate: [AuthGuard]  },
  { path: '**', redirectTo: '/about'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
