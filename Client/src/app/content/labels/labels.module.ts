import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LabelsComponent } from './labels/labels.component';
import { LabelsRouting } from './labels-routing';
import { SharedModule } from 'src/app/shared/shared.module';
import { ApiService } from './api.service';
import { NgxsModule } from '@ngxs/store';
import { LabelStore } from './state/labels-state';
import { environment } from 'src/environments/environment';



@NgModule({
  declarations: [LabelsComponent],
  imports: [
    CommonModule,
    LabelsRouting,
    SharedModule,
    NgxsModule.forRoot([LabelStore], { developmentMode: !environment.production }),
  ],
  providers: [ApiService]
})
export class LabelsModule { }
