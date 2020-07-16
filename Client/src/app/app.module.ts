import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { ContentLoadGuard } from './core/guards/content-load.guard';
import { ContentActiveteGuard } from './core/guards/content-activete.guard';
import { NgxsModule } from '@ngxs/store';
import { LabelStore } from './content/labels/state/labels-state';
import { ApiServiceLabels } from './content/labels/api.service';
import { ContentModule } from './content/content.module';
import { NoteStore } from './content/notes/state/notes-state';
import { ApiServiceNotes } from './content/notes/api.service';
import { UserStore } from './core/stateUser/user-state';
import { NgxsStoragePluginModule } from '@ngxs/storage-plugin';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CoreModule,
    AppRoutingModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    SharedModule,
    ContentModule,
    NgxsModule.forRoot([LabelStore, NoteStore, UserStore]),
    NgxsStoragePluginModule.forRoot({
      key: UserStore
    })
  ],
  providers: [ContentLoadGuard, ContentActiveteGuard],
  bootstrap: [AppComponent],
})
export class AppModule { }
