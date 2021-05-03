import { ElementRef, Injectable, OnDestroy, QueryList } from '@angular/core';
import { Store } from '@ngxs/store';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { MurriService } from 'src/app/shared/services/murri.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FolderTypeENUM } from 'src/app/shared/enums/FolderTypesEnum';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { FolderType } from 'src/app/shared/models/folderType';
import { LoadFolders } from './state/folders-actions';
import { FolderStore } from './state/folders-state';
import { SmallFolder } from './models/folder';
import { UpdateColor } from '../notes/state/updateColor';

@Injectable()
export class FolderService implements OnDestroy {
  destroy = new Subject<void>();

  allFolders: SmallFolder[] = [];

  folders: SmallFolder[] = [];

  firstInitedMurri = false;

  constructor(
    private store: Store,
    public pService: PersonalizationService,
    private murriService: MurriService,
  ) {
    this.store
      .select(FolderStore.updateColorEvent)
      .pipe(takeUntil(this.destroy))
      .subscribe((x) => this.changeColorHandler(x));

    this.store
      .select(FolderStore.removeFromMurriEvent)
      .pipe(takeUntil(this.destroy))
      .subscribe((x) => this.delete(x));

    this.store
      .select(FolderStore.selectedIds)
      .pipe(takeUntil(this.destroy))
      .subscribe((ids) => {
        if (ids) {
          for (const folder of this.folders) {
            if (ids.some((x) => x === folder.id)) {
              folder.isSelected = true;
            } else {
              folder.isSelected = false;
            }
          }
        }
      });

    this.store
      .select(FolderStore.selectedCount)
      .pipe(takeUntil(this.destroy))
      .subscribe((x) => {
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

  murriInitialise(
    refElements: QueryList<ElementRef>,
    folderType: FolderTypeENUM,
    isDragEnabled: boolean = true,
  ) {
    refElements.changes.pipe(takeUntil(this.destroy)).subscribe(async (z) => {
      if (z.length === this.folders.length && this.folders.length !== 0 && !this.firstInitedMurri) {
        const type = this.store
          .selectSnapshot(AppStore.getFolderTypes)
          .find((x) => x.name === folderType);
        this.murriService.initMurriFolder(type, isDragEnabled);
        await this.murriService.setOpacityFlagAsync();
        this.firstInitedMurri = true;
      }
    });
  }

  async loadFolders(typeENUM: FolderType) {
    const types = this.store.selectSnapshot(AppStore.getFolderTypes);
    const type = types.find((x) => x.name === typeENUM.name);
    await this.store.dispatch(new LoadFolders(type.id, typeENUM)).toPromise();

    const actions = types.filter((x) => x.id !== type.id).map((t) => new LoadFolders(t.id, t));
    this.store.dispatch(actions);
  }

  transformFolders = (items: SmallFolder[]) => {
    const folders = [...items];
    return folders.map((note) => {
      return { ...note, isSelected: false, lockRedirect: false };
    });
  };

  firstInit(folders: SmallFolder[]) {
    this.allFolders = [...folders].map((note) => ({ ...note }));
    this.folders = this.allFolders;
  }

  changeColorHandler(updateColor: UpdateColor[]) {
    for (const update of updateColor) {
      if (this.folders.length > 0) {
        this.folders.find((x) => x.id === update.id).color = update.color;
      }
    }
  }

  delete(ids: string[]) {
    if (ids.length > 0) {
      this.folders = this.folders.filter((x) => ids.indexOf(x.id) === -1);
      setTimeout(() => this.murriService.grid.refreshItems().layout(), 0);
    }
  }

  addToDom(folders: SmallFolder[]) {
    if (folders.length > 0) {
      this.folders = [...folders.map((folder) => ({ ...folder })).reverse(), ...this.folders];
      setTimeout(() => {
        const DOMnodes = document.getElementsByClassName('grid-item');
        for (let i = 0; i < folders.length; i += 1) {
          const el = DOMnodes[i];
          this.murriService.grid.add(el, { index: 0, layout: true });
        }
      }, 0);
    }
  }
}
