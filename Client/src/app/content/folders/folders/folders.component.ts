import { Component, OnInit } from '@angular/core';

enum subMenu {
  All = 'all',
  Shared = 'shared',
  Locked = 'locked',
  Archive = 'archive',
  Bin = 'bin'
}

@Component({
  selector: 'app-folders',
  templateUrl: './folders.component.html',
  styleUrls: ['./folders.component.scss']
})
export class FoldersComponent implements OnInit {

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
