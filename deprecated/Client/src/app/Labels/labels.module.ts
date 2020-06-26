import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {LabelsComponent } from './labels/labels.component';
import { LabelComponent } from './label/label.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [LabelsComponent, LabelComponent],
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule
  ],
  exports: [LabelsComponent]
})
export class LabelsModule { }
