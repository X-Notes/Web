import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {LabelsComponent } from './labels/labels.component';
import { LabelComponent } from './label/label.component';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [LabelsComponent, LabelComponent],
  imports: [
    CommonModule,
    HttpClientModule
  ],
  exports: [LabelsComponent]
})
export class LabelsModule { }
