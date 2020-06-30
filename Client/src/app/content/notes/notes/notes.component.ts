import { Component, OnInit } from '@angular/core';
import { Theme } from 'src/app/shared/enums/Theme';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';

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
  menu = subMenu;
  theme = Theme;

  constructor(public pService: PersonalizationService) { }

  ngOnInit(): void {
    this.current = subMenu.All;
  }

  switchSub(value: subMenu) {
    this.current = value;
  }

}
