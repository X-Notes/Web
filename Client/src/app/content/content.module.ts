import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentRouting } from './content-routing';
import { NavigationModule } from './navigation/navigation.module';
import { ContentComponent } from './content/content.component';



@NgModule({
  declarations: [ContentComponent],
  imports: [
    CommonModule, ContentRouting, NavigationModule
  ]
})
export class ContentModule { }
