import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {TrashComponent} from './trash/trash.component';


@NgModule({
  declarations: [TrashComponent],
  imports: [
    CommonModule
  ],
  exports: [TrashComponent]
})
export class BinModule { }
