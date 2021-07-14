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
import {
  FeaturesEntitiesService,
  OrderFilterEntity,
} from 'src/app/shared/services/features-entities.service';

@Injectable()
export class FolderService extends FeaturesEntitiesService<SmallFolder> implements OnDestroy {
  destroy = new Subject<void>();

  sortedFolderByTypeId: SortedByENUM = null;

  constructor(store: Store, public pService: PersonalizationService, murriService: MurriService) {
    super(store, OrderFilterEntity.Folder, murriService);

    this.store
      .select(FolderStore.updateColorEvent)
      .pipe(takeUntil(this.destroy))
      .subscribe((x) => this.changeColorHandler(x));

    this.store
      .select(FolderStore.removeFromMurriEvent)
      .pipe(takeUntil(this.destroy))
      .subscribe((x) => this.deleteFromDom(x));

    this.store
      .select(FolderStore.selectedIds)
      .pipe(takeUntil(this.destroy))
      .subscribe((ids) => {
        if (ids) {
          for (const folder of this.entities) {
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
          for (const folder of this.entities) {
            folder.lockRedirect = true;
          }
        } else {
          for (const folder of this.entities) {
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
      if (
        z.length === this.entities.length &&
        this.entities.length !== 0 &&
        !this.firstInitedMurri
      ) {
        isDragEnabled = isDragEnabled && this.isSortable;
        this.murriService.initMurriFolder(folderType, isDragEnabled);

        await this.firstInitMurri();
      }
      await this.synchronizeState(refElements);
    });
  }

  async changeOrderTypeHandler() {
    await this.murriService.setOpacityFlagAsync(0, false);
    await this.murriService.wait(150);
    this.murriService.grid.destroy();
    this.entities = this.orderBy(this.entities);
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

  get getByCurrentType() {
    switch (this.store.selectSnapshot(AppStore.getTypeFolder)) {
      case FolderTypeENUM.Private: {
        return this.store.selectSnapshot(FolderStore.privateFolders);
      }
      case FolderTypeENUM.Shared: {
        return this.store.selectSnapshot(FolderStore.sharedFolders);
      }
      case FolderTypeENUM.Archive: {
        return this.store.selectSnapshot(FolderStore.archiveFolders);
      }
      case FolderTypeENUM.Deleted: {
        return this.store.selectSnapshot(FolderStore.deletedFolders);
      }
      default: {
        throw new Error('Incorrect type');
      }
    }
  }

  firstInit() {
    let tempNotes = this.transformSpread(this.getByCurrentType);
    this.entities = this.orderBy(tempNotes);
    super.initState();
  }
}
