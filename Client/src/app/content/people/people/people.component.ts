import { Component, OnInit } from '@angular/core';

enum subMenu {
  All = 'all',
  Invitations = 'invitations'
}

@Component({
  selector: 'app-people',
  templateUrl: './people.component.html',
  styleUrls: ['./people.component.scss']
})
export class PeopleComponent implements OnInit {

  current: subMenu;

  constructor() { }

  ngOnInit(): void {
    this.current = subMenu.All;
  }

  switchSub(value: string) {
    switch (value) {
      case subMenu.All:
        this.current = subMenu.All;
        break;
      case subMenu.Invitations:
        this.current = subMenu.Invitations;
        break;
    }
  }

}
