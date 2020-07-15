import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import {MatRippleModule} from '@angular/material/core';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { SimplebarAngularModule } from 'simplebar-angular';


@NgModule({
  declarations: [],
  imports: [CommonModule , TranslateModule, DragDropModule, SimplebarAngularModule],
  exports: [TranslateModule, MatRippleModule, DragDropModule, SimplebarAngularModule]
})
export class SharedModule { }
