import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FaqComponent } from './faq.component';
import { FaqRouting } from './faq-routing';
import { SharedModule } from '../shared/shared.module';
import { FaqListItemComponent } from './components/faq-list-item/faq-list-item.component';

@NgModule({
  declarations: [FaqComponent, FaqListItemComponent],
  imports: [SharedModule, CommonModule, FaqRouting],
})
export class FaqModule {}
