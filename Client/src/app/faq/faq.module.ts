import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FaqComponent } from './faq.component';
import { FaqRouting } from './faq-routing';



@NgModule({
  declarations: [FaqComponent],
  imports: [
    CommonModule,
    FaqRouting
  ]
})
export class FaqModule { }
