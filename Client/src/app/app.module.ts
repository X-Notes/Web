import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NewNoteComponent } from './Notes/new-note/new-note.component';
import { NootsComponent } from './Noots/noots/noots.component';
import { NotesComponent } from './Notes/notes/notes.component';
import { GroupsComponent } from './Groups/groups/groups.component';
import { PeopleComponent } from './People/people/people.component';
import { LabelsComponent } from './Labels/labels/labels.component';
import { InvitesComponent } from './Invites/invites/invites.component';
import { BinComponent } from './Bin/bin/bin.component';
import { NoteComponent } from './Notes/note/note.component';

@NgModule({
  declarations: [
    AppComponent,
    NewNoteComponent,
    NootsComponent,
    NotesComponent,
    GroupsComponent,
    PeopleComponent,
    LabelsComponent,
    InvitesComponent,
    BinComponent,
    NoteComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
