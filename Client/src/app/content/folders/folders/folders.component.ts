import { Component, OnInit, OnDestroy } from '@angular/core';
import { Theme } from 'src/app/shared/enums/Theme';
import { PersonalizationService, sideBarCloseOpen } from 'src/app/shared/services/personalization.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Folder } from '../models/folder';

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
export class FoldersComponent implements OnInit, OnDestroy {

  destroy = new Subject<void>();
  current: subMenu;
  menu = subMenu;
  theme = Theme;
  folders: Folder[] = [
    {name: 'helllo'}, {name: 'helllo'}, {name: 'helllo'}, {name: 'helllo'}, {name: 'helllo'}
  ];

  constructor(public pService: PersonalizationService) { }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  async ngOnInit() {
    this.pService.onResize();
    this.current = subMenu.All;
    this.pService.subject
    .pipe(takeUntil(this.destroy))
    .subscribe(x => this.newFolder());

    await this.folders;

    this.pService.gridSettings('.grid-item');

  }

  newFolder() {
    console.log('folder');
  }

  switchSub(value: subMenu) {
    this.current = value;
  }
}
