import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationModule } from './navigation/navigation.module';
import { ContentComponent } from './content/content.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';



@NgModule({
  declarations: [ContentComponent],
  imports: [
    CommonModule,
    RouterModule,
    NavigationModule,
    SharedModule
  ],
  providers: []
})
export class ContentModule { }
