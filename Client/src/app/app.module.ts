import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NootsComponent } from './Noots/noots/noots.component';
import { NotesComponent } from './Notes/notes/notes.component';
import { GroupsComponent } from './Groups/groups/groups.component';
import { PeopleComponent } from './People/people/people.component';
import { LabelsComponent } from './Labels/labels/labels.component';
import { InvitesComponent } from './Invites/invites/invites.component';
import { BinComponent } from './Bin/bin/bin.component';
import { NootComponent } from './Noots/noot/noot.component';

@NgModule({
  declarations: [
    AppComponent,
    NootsComponent,
    NotesComponent,
    GroupsComponent,
    PeopleComponent,
    LabelsComponent,
    InvitesComponent,
    BinComponent,
    NootComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
