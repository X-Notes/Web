import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NewNoteComponent } from './new-note/new-note.component';
import { ViewLabelComponent } from './view-label/view-label.component';

@NgModule({
  declarations: [
    AppComponent,
    NewNoteComponent,
    ViewLabelComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
