import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavigationModule } from './navigation/navigation.module';
import { ContentComponent } from './content/content.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [ContentComponent],
  imports: [CommonModule, RouterModule, NavigationModule, SharedModule],
  providers: [],
})
export class ContentModule {}
