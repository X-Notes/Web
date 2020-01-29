import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NotesModule } from './Notes/notes.module';
import { PeopleModule } from './People/people.module';
import { LabelsModule } from './Labels/labels.module';
import { BinModule } from './Trash/trash.module';
import { LandingComponent } from './landing/landing.component';
import { MainComponent } from './main/main.component';
// Auth
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { environment } from '../environments/environment';

import { HttpClientModule } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { TokenIntercepter } from './Services/token-intercepter';
import { ContainerComponent } from './Containers/container/container.component';
import { ContainersComponent } from './Containers/containers/containers.component';
import { InvitesComponent } from './HeaderComponents/invites/invites.component';
import { ProfileComponent } from './HeaderComponents/profile/profile.component';
import { NotificationComponent } from './HeaderComponents/notification/notification.component';


@NgModule({
  declarations: [
    AppComponent,
    LandingComponent,
    MainComponent,
    ContainerComponent,
    ContainersComponent,
    InvitesComponent,
    ProfileComponent,
    NotificationComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    PeopleModule,
    NotesModule,
    LabelsModule,
    BinModule,
    HttpClientModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireAuthModule,
  ],
  providers: [{
    provide: HTTP_INTERCEPTORS,
    useClass: TokenIntercepter,
    multi: true}],
  bootstrap: [AppComponent]
})
export class AppModule { }
