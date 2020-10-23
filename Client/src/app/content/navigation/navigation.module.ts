import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SideBarComponent } from './side-bar/side-bar.component';
import { HeaderComponent } from './header/header.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { MenuComponent } from './menu/menu.component';
import { ProfileSectionComponent } from './header-components/profile-section/profile-section.component';
import { RightSectionComponent } from './header-components/right-section/right-section.component';
import { SearchComponent } from './header-components/search/search.component';
import { ButtonThemeComponent } from './header-components/button-theme/button-theme.component';
import { ButtonQuestionComponent } from './header-components/button-question/button-question.component';
import { ButtonNotificationComponent } from './header-components/button-notification/button-notification.component';


@NgModule({
  declarations: [SideBarComponent, HeaderComponent, MenuComponent,
    ProfileSectionComponent, RightSectionComponent, SearchComponent, ButtonThemeComponent, ButtonQuestionComponent, ButtonNotificationComponent],
  imports: [
    CommonModule,
    RouterModule,
    SharedModule
  ],
  exports: [SideBarComponent, HeaderComponent],
  providers: []
})
export class NavigationModule { }
