import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LabelsComponent } from './labels/labels.component';
import { LabelsRouting } from './labels-routing';
import { SharedModule } from 'src/app/shared/shared.module';
import { LabelComponent } from './label/label.component';
import { AllComponent } from './all/all.component';
import { DeletedComponent } from './deleted/deleted.component';



@NgModule({
  declarations: [LabelsComponent, LabelComponent, AllComponent, DeletedComponent],
  imports: [
    CommonModule,
    LabelsRouting,
    SharedModule
  ]
})
export class LabelsModule { }
