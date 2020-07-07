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
    SharedModule
  ],
  providers: [ContentLoadGuard, ContentActiveteGuard],
  bootstrap: [AppComponent],
})
export class AppModule { }
