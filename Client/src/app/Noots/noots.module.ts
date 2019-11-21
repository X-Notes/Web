import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NootComponent} from './noot/noot.component';
import { SavedComponent } from './saved/saved.component';
import { MyNootsComponent } from './my-noots/my-noots.component';
import { WatchLatersComponent } from './watch-laters/watch-laters.component';
import { AllNootsComponent } from './all-noots/all-noots.component';
import { FiltersNootsComponent } from './filters-noots/filters-noots.component';
import { SubscribesComponent } from './Subscribe-folder/subscribes/subscribes.component';
import { NewNootComponent } from './new-noot/new-noot.component';
import { SubscribeComponent } from './Subscribe-folder/subscribe/subscribe.component';


@NgModule({
  declarations: [
    NootComponent,
      SavedComponent,
      MyNootsComponent,
       WatchLatersComponent,
       AllNootsComponent,
       FiltersNootsComponent,
       SubscribesComponent,
       NewNootComponent,
       SubscribeComponent
      ],
  imports: [
    CommonModule
  ],
  exports: [NootComponent]
})
export class NootsModule { }
