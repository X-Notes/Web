import { ElementRef, Injectable, OnDestroy, QueryList } from '@angular/core';
import { Store } from '@ngxs/store';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { MurriService } from 'src/app/shared/services/murri.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FolderTypeENUM } from 'src/app/shared/enums/folder-types.enum';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { SortedByENUM } from 'src/app/core/models/sorted-by.enum';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { FeaturesEntitiesService } from 'src/app/shared/services/features-entities.service';
import { IMurriEntityService } from 'src/app/shared/services/murri-entity.contract';
import { UpdaterEntitiesService } from 'src/app/core/entities-updater.service';
import { SmallFolder } from './models/folder.model';
import { FolderStore } from './state/folders-state';
import { ClearAddToDomFolders, LoadFolders, UpdateOneFolder } from './state/folders-actions';
import { ApiFoldersService } from './api-folders.service';

/** Injection only in component */
@Injectable()
export class FolderService
  extends FeaturesEntitiesService<SmallFolder>
  implements OnDestroy, IMurriEntityService<SmallFolder, FolderTypeENUM> {
  destroy = new Subject<void>();

  prevSortedFolderByTypeId: SortedByENUM = null;

  constructor(
    store: Store,
    public pService: PersonalizationService,
    murriService: MurriService,
    private updateService: UpdaterEntitiesService,
    private apiFolders: ApiFoldersService,
  ) {
    super(store, murriService);

    this.store
      .select(FolderStore.updateFolderEvents)
      .pipe(takeUntil(this.destroy))
      .subscribe(async (values) => {
        await this.updateFolders(values);
      });

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

  get isAnySelected(): boolean {
    return this.entities.some((z) => z.isSelected === true);
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
        await this.loadWithUpdates();
      }
      await this.synchronizeState(refElements, this.sortFolderType === SortedByENUM.AscDate);
    });
  }

  async loadWithUpdates() {
    const pr = this.store.selectSnapshot(UserStore.getPersonalizationSettings);
    this.updateService.foldersIds$.pipe(takeUntil(this.destroy)).subscribe(async (ids) => {
      if (ids.length > 0) {
        const folders = await this.apiFolders.getFoldersMany(ids, pr).toPromise();
        const actionsForUpdate = folders.map((folder) => new UpdateOneFolder(folder));
        this.store.dispatch(actionsForUpdate);
        const transformFolders = this.transformSpread(folders);
        transformFolders.forEach((folder) => {
          const index = this.entities.findIndex((x) => x.id === folder.id);
          this.entities[index].previewNotes = folder.previewNotes;
        });
        await this.murriService.refreshLayoutAsync();
        this.updateService.foldersIds$.next([]);
      }
    });
  }

  async loadAdditionInformation() {
    const folderIds = this.entities.map((x) => x.id);
    if (folderIds.length > 0) {
      const additionalInfo = await this.apiFolders.getAdditionalInfos(folderIds).toPromise();
      for (const info of additionalInfo) {
        const noteIndex = this.entities.findIndex((x) => x.id === info.folderId);
        this.entities[noteIndex].additionalInfo = info;
      }
    }
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
    const pr = this.store.selectSnapshot(UserStore.getPersonalizationSettings);
    await this.store.dispatch(new LoadFolders(typeENUM, pr)).toPromise();

    const types = Object.values(FolderTypeENUM).filter(
      (z) => typeof z === 'number' && z !== typeENUM,
    );
    const actions = types.map((t: FolderTypeENUM) => new LoadFolders(t, pr));
    this.store.dispatch(actions);
  }

  async initializeEntities(folders: SmallFolder[]) {
    const tempFolders = this.transformSpread(folders);
    this.entities = this.orderBy(tempFolders, this.pageSortType);
    super.initState();

    await this.loadAdditionInformation();
  }
}
