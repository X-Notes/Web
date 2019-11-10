import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NootsModule } from './Noots/noots.module';
import { NotesModule } from './Notes/notes.module';
import { GroupsModule} from './Groups/groups.module';
import { PeopleModule } from './People/people.module';
import { LabelsModule } from './Labels/labels.module';
import {InvitesModule } from './Invites/invites.module';
import { BinModule } from './Bin/bin.module';
import { LandingComponent } from './landing/landing.component';
import { MainComponent } from './main/main.component';
// Auth
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { environment } from '../environments/environment';

@NgModule({
  declarations: [
    AppComponent,
    LandingComponent,
    MainComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    PeopleModule,
    NotesModule,
    NootsModule,
    LabelsModule,
    InvitesModule,
    GroupsModule,
    BinModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireAuthModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
