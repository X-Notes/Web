import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {LabelsComponent } from './labels/labels.component';


@NgModule({
  declarations: [LabelsComponent],
  imports: [
    CommonModule
  ],
  exports: [LabelsComponent]
})
export class LabelsModule { }
