import { ElementRef, Injectable, OnDestroy, QueryList } from '@angular/core';
import { UpdateColor } from '../notes/state/updateColor';
import { Folder } from './models/folder';
import { Store } from '@ngxs/store';
import { FolderStore } from './state/folders-state';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { MurriService } from 'src/app/shared/services/murri.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FolderType } from 'src/app/shared/enums/FolderTypes';

@Injectable()
export class FolderService implements OnDestroy {

  destroy  = new Subject<void>();
  allFolders: Folder[] = [];
  folders: Folder[] = [];
  firstInitedMurri = false;

  constructor(private store: Store,
              public pService: PersonalizationService,
              private murriService: MurriService) {

    this.store.select(FolderStore.updateColorEvent)
      .pipe(takeUntil(this.destroy))
      .subscribe(x => this.changeColorHandler(x));

    this.store.select(FolderStore.removeFromMurriEvent)
      .pipe(takeUntil(this.destroy))
      .subscribe(x => this.delete(x));

    this.store.select(FolderStore.selectedIds)
      .pipe(takeUntil(this.destroy))
      .subscribe(ids => {
        if (ids) {
          for (const folder of this.folders) {
            if (ids.some(x => x === folder.id)) {
              folder.isSelected = true;
            } else {
              folder.isSelected = false;
            }
          }
        }
      });

    this.store.select(FolderStore.selectedCount)
      .pipe(takeUntil(this.destroy))
      .subscribe(x => {
        if (x > 0) {
          for (const folder of this.folders) {
            folder.lockRedirect = true;
          }
        } else {
          for (const folder of this.folders) {
            folder.lockRedirect = false;
          }
        }
      });

  }
  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  murriInitialise(refElements: QueryList<ElementRef>, folderType: FolderType)
  {
    refElements.changes
    .pipe(takeUntil(this.destroy))
    .subscribe(async (z) => {
      if (z.length === this.folders.length && !this.firstInitedMurri)
      {
        this.murriService.initMurriFolder(folderType);
        await this.murriService.setOpacityTrueAsync();
        this.firstInitedMurri = true;
      }
    });
  }

  transformFolders(folders: Folder[]) {
    folders = [...folders];
    return folders.map(note => {
      return {...note, isSelected: false, lockRedirect: false};
    });
  }

  firstInit(folders: Folder[]) {
    this.allFolders = [...folders].map(note => { note = {...note}; return note; });
    this.folders = this.allFolders;
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
