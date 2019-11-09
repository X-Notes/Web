import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NootComponent} from './noot/noot.component';
import {NootsComponent } from './noots/noots.component';


@NgModule({
  declarations: [ NootComponent, NootsComponent],
  imports: [
    CommonModule
  ],
  exports: [NootComponent, NootsComponent]
})
export class NootsModule { }
