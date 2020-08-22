import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationModule } from './navigation/navigation.module';
import { ContentComponent } from './content/content.component';
import { RouterModule } from '@angular/router';
import { OrderService } from '../shared/services/order.service';
import { SharedModule } from '../shared/shared.module';



@NgModule({
  declarations: [ContentComponent],
  imports: [
    CommonModule,
    RouterModule,
    NavigationModule,
    SharedModule
  ],
  providers: [OrderService]
})
export class ContentModule { }
