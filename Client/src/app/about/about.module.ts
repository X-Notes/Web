import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AboutComponent } from './about/about.component';
import { AboutRouting } from './about-routing';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [AboutComponent],
  imports: [CommonModule, AboutRouting, SharedModule],
})
export class AboutModule {}
