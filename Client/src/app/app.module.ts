import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NewNoteComponent } from './new-note/new-note.component';
import { NootsComponent } from './noots/noots.component';
import { NotesComponent } from './notes/notes.component';
import { GroupsComponent } from './groups/groups.component';
import { PeopleComponent } from './people/people.component';
import { LabelsComponent } from './labels/labels.component';
import { InvitesComponent } from './invites/invites.component';
import { BinComponent } from './bin/bin.component';

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
    BinComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
