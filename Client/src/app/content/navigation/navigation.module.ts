import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { SideBarComponent } from './side-bar/side-bar.component';
import { HeaderComponent } from './header/header.component';
import { MenuComponent } from './menu/menu.component';
import { InteractionProfileComponent } from './header-components/interaction-profile/interaction-profile.component';
import { InteractionToolsComponent } from './header-components/interaction-tools/interaction-tools.component';
import { InteractionItemsComponent } from './header-components/interaction-items/interaction-items.component';
import { InteractionInnerNoteComponent } from './header-components/interaction-inner-note/interaction-inner-note.component';
import { NotificationComponent } from './header-components/notification/notification.component';
import { InteractionInnerFolderComponent } from './header-components/interaction-inner-folder/interaction-inner-folder.component';
import { GeneralHeaderButtonComponent } from './header-components/general-header-button/general-header-button.component';
import { SearchResultComponent } from './header-components/interaction-tools/search-result/search-result.component';
import { NotificationMessageComponent } from './header-components/notification/notification-message/notification-message.component';
import { FullNoteActiveUsersComponent } from './header-components/full-note-active-users/full-note-active-users.component';

@NgModule({
  declarations: [
    SideBarComponent,
    HeaderComponent,
    MenuComponent,
    InteractionProfileComponent,
    InteractionToolsComponent,
    InteractionItemsComponent,
    InteractionInnerNoteComponent,
    NotificationComponent,
    InteractionInnerFolderComponent,
    GeneralHeaderButtonComponent,
    SearchResultComponent,
    NotificationMessageComponent,
    FullNoteActiveUsersComponent,
  ],
  imports: [CommonModule, RouterModule, SharedModule],
  exports: [SideBarComponent, HeaderComponent, FullNoteActiveUsersComponent],
  providers: [],
})
export class NavigationModule {}
