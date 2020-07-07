import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LabelsComponent } from './labels/labels.component';
import { LabelsRouting } from './labels-routing';
import { SharedModule } from 'src/app/shared/shared.module';
import { LabelComponent } from './label/label.component';



@NgModule({
  declarations: [LabelsComponent, LabelComponent],
  imports: [
    CommonModule,
    LabelsRouting,
    SharedModule
  ]
})
export class LabelsModule { }
