import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationModule } from './navigation/navigation.module';
import { ContentComponent } from './content/content.component';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [ContentComponent],
  imports: [
    CommonModule,
    RouterModule,
    NavigationModule,
  ]
})
export class ContentModule { }
