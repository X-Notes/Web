import { Component, OnInit } from '@angular/core';
import { Theme } from 'src/app/shared/enums/Theme';
import { PersonalizationService, sideBarCloseOpen } from 'src/app/shared/services/personalization.service';

export enum subMenu {
  All = 'all',
  Shared = 'shared',
  Locked = 'locked',
  Archive = 'archive',
  Bin = 'bin'
}

@Component({
  selector: 'app-folders',
  templateUrl: './folders.component.html',
  styleUrls: ['./folders.component.scss'],
  animations: [ sideBarCloseOpen ]
})
export class FoldersComponent implements OnInit {

  current: subMenu;
  menu = subMenu;
  theme = Theme;

  constructor(public pService: PersonalizationService) { }

  ngOnInit(): void {
    this.current = subMenu.All;
  }

  switchSub(value: subMenu) {
    this.current = value;
  }

  cancelSideBar() {
    this.pService.stateSidebar = false;
  }

}
