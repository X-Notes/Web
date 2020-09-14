import { Injectable } from '@angular/core';
import { UpdateColor } from '../notes/state/updateColor';
import { Folder } from './models/folder';
import { Store } from '@ngxs/store';
import { FolderStore } from './state/folders-state';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';

@Injectable()
export class FolderService {

  folders: Folder[] = [];

  constructor(private store: Store,
              public pService: PersonalizationService) {

    this.store.select(FolderStore.updateColorEvent)
      .subscribe(x => this.changeColorHandler(x));

    this.store.select(FolderStore.removeFromMurriEvent)
      .subscribe(x => this.delete(x));

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
      setTimeout(() => this.pService.grid.refreshItems().layout(), 0);
    }
  }

  addToDom(folders: Folder[]) {
    if (folders.length > 0) {
      this.folders = [...folders.map(folder => { folder = { ...folder }; return folder; }).reverse(), ...this.folders];
      setTimeout(() => {
        const DOMnodes = document.getElementsByClassName('grid-item');
        for (let i = 0; i < folders.length; i++) {
          const el = DOMnodes[i];
          this.pService.grid.add(el, { index: 0, layout: true });
        }
      }, 0);
    }
  }

}
