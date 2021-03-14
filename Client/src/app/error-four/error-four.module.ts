import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageComponent } from './page/page.component';
import { ErrorRouting } from './error-routing';

@NgModule({
  declarations: [PageComponent],
  imports: [CommonModule, ErrorRouting],
})
export class ErrorFourModule {}
