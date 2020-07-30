import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationModule } from './navigation/navigation.module';
import { ContentComponent } from './content/content.component';
import { RouterModule } from '@angular/router';
import { OrderService } from '../shared/services/order.service';



@NgModule({
  declarations: [ContentComponent],
  imports: [
    CommonModule,
    RouterModule,
    NavigationModule,
  ],
  providers: [OrderService]
})
export class ContentModule { }
