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
import { AuthGuard } from './Guards/auth.guard';
import { NotesContainerComponent} from './Notes/notes-container/notes-container.component';
import { ContainersComponent } from './Containers/containers/containers.component';
import { ProfileComponent } from './profile/profile.component';
import { NoteComponent } from './Notes/note/note.component';
import { FullNoteComponent } from './Notes/full-note/full-note.component';
import { DeAuthGuard } from './Guards/de-auth.guard';

const ChildNotesRoutes: Routes = [
  { path: '', component: AllNotesComponent},
  { path: 'shared', component: SharedNotesComponent},
  { path: 'locked', component: LockedNotesComponent},
  { path: 'note/:id', component: FullNoteComponent},
  { path: '**', redirectTo: ''}
];

const RoutesMain: Routes =
[
  {path: 'notes', component: NotesContainerComponent, children: ChildNotesRoutes, canActivate: [AuthGuard]},
  {path: 'folders', component: ContainersComponent, canActivate: [AuthGuard]},
  {path: 'people', component: PeopleComponent, canActivate: [AuthGuard]},
  {path: 'labels', component: LabelsComponent, canActivate: [AuthGuard]},
  {path: 'bin', component: TrashComponent, canActivate: [AuthGuard]},
  {path: 'profile', component: ProfileComponent, canActivate: [AuthGuard]},
  { path: '**', redirectTo: 'notes'}
];

const routes: Routes = [

  { path: 'about', component: LandingComponent,  canActivate: [DeAuthGuard]},
  { path: '', component: MainComponent, children: RoutesMain, canActivate: [AuthGuard]  },
  { path: '**', redirectTo: '/about'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
