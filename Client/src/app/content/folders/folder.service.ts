import { ElementRef, Injectable, OnDestroy, QueryList } from '@angular/core';
import { Store } from '@ngxs/store';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { MurriService } from 'src/app/shared/services/murri.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FolderTypeENUM } from 'src/app/shared/enums/folder-types.enum';
import { LoadFolders } from './state/folders-actions';
import { FolderStore } from './state/folders-state';
import { SmallFolder } from './models/folder.model';
import { UpdateColor } from '../notes/state/update-color.model';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { SortedByENUM } from 'src/app/core/models/sorted-by.enum';
import { AppStore } from 'src/app/core/stateApp/app-state';

@Injectable()
export class FolderService implements OnDestroy {
  destroy = new Subject<void>();

  folders: SmallFolder[] = [];

  firstInitedMurri = false;

  sortedFolderByTypeId: SortedByENUM = null;

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

    this.store
      .select(UserStore.getPersonalizationSettings)
      .pipe(takeUntil(this.destroy))
      .subscribe(async (pr) => {
        if (this.sortedFolderByTypeId && this.sortedFolderByTypeId !== pr.sortedFolderByTypeId) {
          this.sortedFolderByTypeId = pr.sortedFolderByTypeId;
          await this.changeOrderTypeHandler();
        } else {
          this.sortedFolderByTypeId = pr.sortedFolderByTypeId;
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
        isDragEnabled = isDragEnabled && this.isSortable;
        this.murriService.initMurriFolder(folderType, isDragEnabled);
        await this.murriService.setOpacityFlagAsync();
        this.firstInitedMurri = true;
      }
    });
  }

  async changeOrderTypeHandler() {
    await this.murriService.setOpacityFlagAsync(0, false);
    await this.murriService.wait(150);
    this.murriService.grid.destroy();
    this.folders = this.orderBy(this.folders);
    const roadType = this.store.selectSnapshot(AppStore.getTypeFolder);
    const isDraggable = roadType !== FolderTypeENUM.Shared && this.isSortable;
    this.murriService.initMurriFolderAsync(roadType, isDraggable);
    await this.murriService.setOpacityFlagAsync(0);
  }

  get isSortable() {
    return (
      this.store.selectSnapshot(UserStore.getPersonalizationSettings).sortedFolderByTypeId ===
      SortedByENUM.CustomOrder
    );
  }

  async loadFolders(typeENUM: FolderTypeENUM) {
    await this.store.dispatch(new LoadFolders(typeENUM)).toPromise();

    const types = Object.values(FolderTypeENUM).filter(
      (z) => typeof z == 'number' && z !== typeENUM,
    );
    const actions = types.map((t: FolderTypeENUM) => new LoadFolders(t));
    this.store.dispatch(actions);
  }

  transformFolders = (items: SmallFolder[]) => {
    const folders = [...items];
    return folders.map((note) => {
      return { ...note, isSelected: false, lockRedirect: false };
    });
  };

  firstInit(folders: SmallFolder[]) {
    folders = this.orderBy(folders);
    this.folders = [...folders].map((note) => ({ ...note }));
  }

  orderBy(folders: SmallFolder[]) {
    if (this.store.selectSnapshot(AppStore.getTypeFolder) === FolderTypeENUM.Shared) {
      return folders.sort(
        (a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
      );
    }

    const pr = this.store.selectSnapshot(UserStore.getPersonalizationSettings);
    switch (pr.sortedFolderByTypeId) {
      case SortedByENUM.AscDate: {
        return folders.sort(
          (a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
        );
      }
      case SortedByENUM.DescDate: {
        return folders.sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        );
      }
      case SortedByENUM.CustomOrder: {
        return folders.sort((a, b) => a.order - b.order);
      }
    }
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
