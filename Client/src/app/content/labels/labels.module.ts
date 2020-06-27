import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LabelsComponent } from './labels/labels.component';
import { LabelsRouting } from './labels-routing';



@NgModule({
  declarations: [LabelsComponent],
  imports: [
    CommonModule, LabelsRouting
  ]
})
export class LabelsModule { }
