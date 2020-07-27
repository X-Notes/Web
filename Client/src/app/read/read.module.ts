import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReadComponent } from './read/read.component';
import { ReadRouting } from './read-routing';



@NgModule({
  declarations: [ReadComponent],
  imports: [
    CommonModule,
    ReadRouting
  ]
})
export class ReadModule { }
