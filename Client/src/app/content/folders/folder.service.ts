import { ElementRef, Injectable, OnDestroy, QueryList } from '@angular/core';
import { Store } from '@ngxs/store';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { MurriService } from 'src/app/shared/services/murri.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FolderTypeENUM } from 'src/app/shared/enums/folder-types.enum';
import { ClearAddToDomFolders, LoadFolders } from './state/folders-actions';
import { FolderStore } from './state/folders-state';
import { SmallFolder } from './models/folder.model';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { SortedByENUM } from 'src/app/core/models/sorted-by.enum';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { FeaturesEntitiesService } from 'src/app/shared/services/features-entities.service';
import { IMurriEntityService } from 'src/app/shared/services/murri-entity.contract';

/** Injection only in component */
@Injectable()
export class FolderService
  extends FeaturesEntitiesService<SmallFolder>
  implements OnDestroy, IMurriEntityService<SmallFolder, FolderTypeENUM> {
  destroy = new Subject<void>();

  prevSortedFolderByTypeId: SortedByENUM = null;

  constructor(store: Store, public pService: PersonalizationService, murriService: MurriService) {
    super(store, murriService);

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
      .subscribe((ids) => this.handleSelectEntities(ids));

    this.store
      .select(FolderStore.selectedCount)
      .pipe(takeUntil(this.destroy))
      .subscribe((count) => this.handleLockRedirect(count));

    this.store
      .select(UserStore.getPersonalizationSettings)
      .pipe(takeUntil(this.destroy))
      .subscribe(async (pr) => {
        if (
          this.prevSortedFolderByTypeId &&
          this.prevSortedFolderByTypeId !== pr.sortedFolderByTypeId
        ) {
          this.prevSortedFolderByTypeId = pr.sortedFolderByTypeId;
          await this.changeOrderTypeHandler(this.pageSortType);
        } else {
          this.prevSortedFolderByTypeId = pr.sortedFolderByTypeId;
        }
      });

    this.store
      .select(FolderStore.foldersAddToDOM)
      .pipe(takeUntil(this.destroy))
      .subscribe((x) => {
        if (x.length > 0) {
          this.addToDom(x);
          this.store.dispatch(ClearAddToDomFolders);
        }
      });
  }

  ngOnDestroy(): void {
    console.log('folder destroy');
    super.destroyLayout();
    this.destroy.next();
    this.destroy.complete();
  }

  murriInitialise(
    refElements: QueryList<ElementRef>,
    folderType: FolderTypeENUM,
    isDragEnabled: boolean = true,
  ) {
    refElements.changes.pipe(takeUntil(this.destroy)).subscribe(async (z) => {
      if (this.getIsFirstInit(z)) {
        isDragEnabled = isDragEnabled && this.isSortable;
        this.murriService.initMurriFolder(folderType, isDragEnabled);
        await this.setInitMurriFlagShowLayout();
      }
      await this.synchronizeState(refElements, this.sortFolderType === SortedByENUM.AscDate);
    });
  }

  async changeOrderTypeHandler(sortType: SortedByENUM) {
    await this.destroyGridAsync();
    this.entities = this.orderBy(this.entities, sortType);
    const roadType = this.store.selectSnapshot(AppStore.getTypeFolder);
    const isDraggable = roadType !== FolderTypeENUM.Shared && this.isSortable;
    this.murriService.initMurriFolderAsync(roadType, isDraggable);
    await this.murriService.setOpacityFlagAsync(0);
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

  get isSortable() {
    return this.sortFolderType === SortedByENUM.CustomOrder;
  }

  get sortFolderType() {
    return this.store.selectSnapshot(UserStore.getPersonalizationSettings).sortedFolderByTypeId;
  }

  get pageSortType(): SortedByENUM {
    const isSharedType =
      this.store.selectSnapshot(AppStore.getTypeFolder) === FolderTypeENUM.Shared;
    if (isSharedType) {
      return SortedByENUM.DescDate;
    }
    return this.sortFolderType;
  }

  async initializeEntities(folders: SmallFolder[]) {
    let tempFolders = this.transformSpread(folders);
    this.entities = this.orderBy(tempFolders, this.pageSortType);
    super.initState();
  }
}
