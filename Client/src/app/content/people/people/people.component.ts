import { Component, OnInit } from '@angular/core';
import { Theme } from 'src/app/shared/enums/Theme';
import { PersonalizationService, sideBarCloseOpen } from 'src/app/shared/services/personalization.service';

export enum subMenu {
  All = 'all',
  Invitations = 'invitations'
}

@Component({
  selector: 'app-people',
  templateUrl: './people.component.html',
  styleUrls: ['./people.component.scss'],
  animations: [ sideBarCloseOpen ]
})
export class PeopleComponent implements OnInit {

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
