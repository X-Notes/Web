import { Component, OnInit } from '@angular/core';

enum subMenu {
  All = 'all',
  Shared = 'shared',
  Locked = 'locked',
  Archive = 'archive',
  Bin = 'bin'
}

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.scss']
})

export class NotesComponent implements OnInit {

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
      case subMenu.Shared:
        this.current = subMenu.Shared;
        break;
      case subMenu.Locked:
        this.current = subMenu.Locked;
        break;
      case subMenu.Archive:
        this.current = subMenu.Archive;
        break;
      case subMenu.Bin:
        this.current = subMenu.Bin;
        break;
    }
  }

}
