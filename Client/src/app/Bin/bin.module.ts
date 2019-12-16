import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {BinComponent} from './bin/bin.component';


@NgModule({
  declarations: [BinComponent],
  imports: [
    CommonModule
  ],
  exports: [BinComponent]
})
export class BinModule { }
