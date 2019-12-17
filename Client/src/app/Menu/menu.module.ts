import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UpperMenuComponent } from './upper-menu/upper-menu.component';



@NgModule({
  declarations: [UpperMenuComponent],
  imports: [
    CommonModule,
  ],
  exports: [UpperMenuComponent]
})
export class MenuModule { }
