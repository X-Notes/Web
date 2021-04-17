import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { SideBarComponent } from './side-bar/side-bar.component';
import { HeaderComponent } from './header/header.component';
import { MenuComponent } from './menu/menu.component';
import { InteractionLabelsComponent } from './header-components/interaction-labels/interaction-labels.component';
import { InteractionProfileComponent } from './header-components/interaction-profile/interaction-profile.component';
import { InteractionToolsComponent } from './header-components/interaction-tools/interaction-tools.component';
import { InteractionItemsComponent } from './header-components/interaction-items/interaction-items.component';
import { InteractionInnerComponent } from './header-components/interaction-inner/interaction-inner.component';
import { NotificationComponent } from './header-components/notification/notification.component';
import { InteractionInnerFolderComponent } from './header-components/interaction-inner-folder/interaction-inner-folder.component';
import { GeneralHeaderButtonComponent } from './header-components/general-header-button/general-header-button.component';

@NgModule({
  declarations: [
    SideBarComponent,
    HeaderComponent,
    MenuComponent,
    InteractionLabelsComponent,
    InteractionProfileComponent,
    InteractionToolsComponent,
    InteractionItemsComponent,
    InteractionInnerComponent,
    NotificationComponent,
    InteractionInnerFolderComponent,
    GeneralHeaderButtonComponent,
  ],
  imports: [CommonModule, RouterModule, SharedModule],
  exports: [SideBarComponent, HeaderComponent],
  providers: [],
})
export class NavigationModule {}
