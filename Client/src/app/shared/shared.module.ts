import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import {MatRippleModule} from '@angular/material/core';
import { DragDropModule } from '@angular/cdk/drag-drop';


@NgModule({
  declarations: [],
  imports: [CommonModule , TranslateModule, DragDropModule],
  exports: [TranslateModule, MatRippleModule, DragDropModule]
})
export class SharedModule { }
