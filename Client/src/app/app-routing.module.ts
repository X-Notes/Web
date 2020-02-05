import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PeopleComponent } from './People/people/people.component';
import { LabelsComponent } from './Labels/labels/labels.component';
import { TrashComponent } from './Trash/trash/trash.component';
import {LandingComponent} from './landing/landing.component';
import {MainComponent} from './main/main.component';
import {AllNotesComponent} from './Notes/all-notes/all-notes.component';
import {SharedNotesComponent} from './Notes/shared-notes/shared-notes.component';
import { LockedNotesComponent} from './Notes/locked-notes/locked-notes.component';
import {NewNoteComponent} from './Notes/new-note/new-note.component';
import { AuthGuard } from './Guards/auth.guard';
import { NotesContainerComponent} from './Notes/notes-container/notes-container.component';
import { ContainersComponent } from './Containers/containers/containers.component';
import { ProfileComponent } from './profile/profile.component';

const ChildNotesRoutes: Routes = [
  { path: '', component: AllNotesComponent},
  { path: 'all', component: AllNotesComponent},
  { path: 'shared', component: SharedNotesComponent},
  { path: 'locked', component: LockedNotesComponent},
  { path: 'new', component: NewNoteComponent}
];

const RoutesMain: Routes =
[
  {path: 'notes', component: NotesContainerComponent, children: ChildNotesRoutes, canActivate: [AuthGuard]},
  {path: 'folders', component: ContainersComponent, canActivate: [AuthGuard]},
  {path: 'people', component: PeopleComponent, canActivate: [AuthGuard]},
  {path: 'labels', component: LabelsComponent, canActivate: [AuthGuard]},
  {path: 'bin', component: TrashComponent, canActivate: [AuthGuard]},
  {path: 'profile', component: ProfileComponent, canActivate: [AuthGuard]}
];

const routes: Routes = [

  {path: 'about', component: LandingComponent},
  {path: '', component: MainComponent, children: RoutesMain, canActivate: [AuthGuard]  },
  { path: '**', redirectTo: '/about'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
