import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavigationModule } from './navigation/navigation.module';
import { ContentComponent } from './content/content.component';
import { SharedModule } from '../shared/shared.module';
import { LongTermOperationsHandlerComponent } from './long-term-operations-handler/long-term-operations-handler.component';
import { LongTermOperationComponent } from './long-term-operations-handler/long-term-operation/long-term-operation.component';

@NgModule({
  declarations: [ContentComponent, LongTermOperationsHandlerComponent, LongTermOperationComponent],
  imports: [CommonModule, RouterModule, NavigationModule, SharedModule],
  providers: [],
})
export class ContentModule {}
