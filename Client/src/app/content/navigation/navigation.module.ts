import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SideBarComponent } from './side-bar/side-bar.component';
import { HeaderComponent } from './header/header.component';
import { RouterModule } from '@angular/router';


@NgModule({
  declarations: [SideBarComponent, HeaderComponent],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [SideBarComponent, HeaderComponent]
})
export class NavigationModule { }
