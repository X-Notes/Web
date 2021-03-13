import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { MurriService } from 'src/app/shared/services/murri.service';
import { LabelsComponent } from './labels/labels.component';
import { LabelsRouting } from './labels-routing';
import { AllComponent } from './all/all.component';
import { DeletedComponent } from './deleted/deleted.component';

@NgModule({
  declarations: [LabelsComponent, AllComponent, DeletedComponent],
  imports: [CommonModule, LabelsRouting, SharedModule],
  providers: [MurriService],
})
export class LabelsModule {}
