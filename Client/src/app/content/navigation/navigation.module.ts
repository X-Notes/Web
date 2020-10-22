import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SideBarComponent } from './side-bar/side-bar.component';
import { HeaderComponent } from './header/header.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { MenuComponent } from './menu/menu.component';
import { ProfileSectionComponent } from './header-components/profile-section/profile-section.component';
import { LeftSectionComponent } from './header-components/left-section/left-section.component';


@NgModule({
  declarations: [SideBarComponent, HeaderComponent, MenuComponent, ProfileSectionComponent, LeftSectionComponent],
  imports: [
    CommonModule,
    RouterModule,
    SharedModule
  ],
  exports: [SideBarComponent, HeaderComponent],
  providers: []
})
export class NavigationModule { }
