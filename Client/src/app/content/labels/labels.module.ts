import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LabelsComponent } from './labels/labels.component';
import { LabelsRouting } from './labels-routing';
import { SharedModule } from 'src/app/shared/shared.module';
import { ApiService } from './api.service';
import { NgxsModule } from '@ngxs/store';
import { LabelStore } from './state/labels-state';
import { environment } from 'src/environments/environment';
import { LabelComponent } from './label/label.component';



@NgModule({
  declarations: [LabelsComponent, LabelComponent],
  imports: [
    CommonModule,
    LabelsRouting,
    SharedModule
  ],
  providers: [ApiService]
})
export class LabelsModule { }
