import { Component, OnInit } from '@angular/core';
import { Theme } from 'src/app/shared/enums/Theme';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { Action } from 'rxjs/internal/scheduler/Action';

export enum subMenu {
  All = 'all',
  Shared = 'shared',
  Locked = 'locked',
  Archive = 'archive',
  Bin = 'bin'
}

export interface Label {
  id: number;
  active: boolean;
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
  labelsActive: number[] = [];
  labels: Label[] = [
    {id: 1, active: false},
    {id: 2, active: false},
    {id: 3, active: false}
  ];
  cancel = false;

  constructor(public pService: PersonalizationService) { }

  ngOnInit(): void {
    this.current = subMenu.All;
  }

  cancelLabel() {
    this.cancel = false;
    this.labelsActive = [];
    this.labels.map(x => x.active = false);
  }
  cancelAdd(id: number) {
    if (this.labelsActive.includes(id)) {
      this.labelsActive = this.labelsActive.filter(x => x !== id);
      this.labels.filter(x => x.id === id).map(x => x.active = false);
    } else {
      this.labelsActive.push(id);
      this.labels.filter(x => x.id === id).map(x => x.active = true);
      this.cancel = true;
    }
    if (this.labelsActive.length === 0) {
      this.cancel = false;
    }
  }

  switchSub(value: subMenu) {
    this.current = value;
  }

}
