import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {LabelsComponent } from './labels/labels.component';
import { LabelComponent } from './label/label.component';


@NgModule({
  declarations: [LabelsComponent, LabelComponent],
  imports: [
    CommonModule
  ],
  exports: [LabelsComponent]
})
export class LabelsModule { }
