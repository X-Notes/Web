import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SideBarComponent } from './side-bar/side-bar.component';
import { HeaderComponent } from './header/header.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { MenuComponent } from './menu/menu.component';
import { InteractionNotesComponent } from './header-components/interaction-notes/interaction-notes.component';
import { InteractionFoldersComponent } from './header-components/interaction-folders/interaction-folders.component';
import { InteractionLabelsComponent } from './header-components/interaction-labels/interaction-labels.component';
import { InteractionProfileComponent } from './header-components/interaction-profile/interaction-profile.component';
import { InteractionToolsComponent } from './header-components/interaction-tools/interaction-tools.component';


@NgModule({
  declarations: [SideBarComponent, HeaderComponent, MenuComponent, InteractionNotesComponent, InteractionFoldersComponent, InteractionLabelsComponent, InteractionProfileComponent, InteractionToolsComponent],
  imports: [
    CommonModule,
    RouterModule,
    SharedModule
  ],
  exports: [SideBarComponent, HeaderComponent],
  providers: []
})
export class NavigationModule { }
