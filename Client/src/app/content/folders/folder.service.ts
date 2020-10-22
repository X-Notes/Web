import { Injectable, OnDestroy } from '@angular/core';
import { UpdateColor } from '../notes/state/updateColor';
import { Folder } from './models/folder';
import { Store } from '@ngxs/store';
import { FolderStore } from './state/folders-state';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { MurriService } from 'src/app/shared/services/murri.service';
import { PaginationService } from 'src/app/shared/services/pagination.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Injectable()
export class FolderService implements OnDestroy {

  destroy  = new Subject<void>();
  allFolders: Folder[] = [];
  folders: Folder[] = [];

  constructor(private store: Store,
              public pService: PersonalizationService,
              private murriService: MurriService,
              private pagService: PaginationService) {

    this.store.select(FolderStore.updateColorEvent)
      .subscribe(x => this.changeColorHandler(x));

    this.store.select(FolderStore.removeFromMurriEvent)
      .subscribe(x => this.delete(x));

    this.pagService.nextPagination
      .pipe(takeUntil(this.destroy))
      .subscribe(x => this.nextValuesForPagination());
  }
  ngOnDestroy(): void {
    console.log('destroy');
    this.destroy.next();
    this.destroy.complete();
  }

  nextValuesForPagination() {
    console.log('FOlders');
    console.log(this.folders.length);
    console.log(this.pagService.countNextFolders);
    const nextFolders = this.allFolders.slice(this.folders.length, this.folders.length + this.pagService.countNextFolders);
    this.addToDomAppend(nextFolders);
  }

  firstInit(folders: Folder[]) {
    this.allFolders = [...folders].map(note => { note = {...note}; return note; });
    this.folders = this.allFolders.slice(0, 30);
    this.pagService.newPage();
  }

  changeColorHandler(updateColor: UpdateColor[]) {
    for (const update of updateColor) {
      if (this.folders.length > 0) {
      this.folders.find(x => x.id === update.id).color = update.color;
      }
    }
  }

  delete(ids: string[]) {
    if (ids.length > 0) {
      this.folders = this.folders.filter(x => ids.indexOf(x.id) !== -1 ? false : true);
      setTimeout(() => this.murriService.grid.refreshItems().layout(), 0);
    }
  }

  addToDom(folders: Folder[]) {
    if (folders.length > 0) {
      this.folders = [...folders.map(folder => { folder = { ...folder }; return folder; }).reverse(), ...this.folders];
      setTimeout(() => {
        const DOMnodes = document.getElementsByClassName('grid-item');
        for (let i = 0; i < folders.length; i++) {
          const el = DOMnodes[i];
          this.murriService.grid.add(el, { index: 0, layout: true });
        }
      }, 0);
    }
  }

  addToDomAppend(folders: Folder[]) {
    if (folders.length > 0) {
      this.folders = [...folders.map(note => { note = { ...note }; return note; }) , ...this.folders];
      setTimeout(() => {
        const DOMnodes = document.getElementsByClassName('grid-item');
        for (let i = 0; i < folders.length; i++) {
          const el = DOMnodes[i];
          this.murriService.grid.add(el, {index: -1, layout: true});
        }
      }, 0);
    }
  }

}
