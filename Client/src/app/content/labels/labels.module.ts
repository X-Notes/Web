import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LabelsComponent } from './labels/labels.component';
import { LabelsRouting } from './labels-routing';
import { SharedModule } from 'src/app/shared/shared.module';



@NgModule({
  declarations: [LabelsComponent],
  imports: [
    CommonModule,
    LabelsRouting,
    SharedModule
  ]
})
export class LabelsModule { }
