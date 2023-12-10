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
import { UpdaterEntitiesService } from 'src/app/core/entities-updater.service';
import { SmallFolder } from './models/folder.model';
import { FolderStore } from './state/folders-state';
import {
  ClearAddToDomFolders,
  ClearUpdatesUIFolders,
  LoadFolders,
  UpdateOneFolder,
  UpdatePositionsFolders,
} from './state/folders-actions';
import { ApiFoldersService } from './api-folders.service';
import { FolderComponent } from './folder/folder.component';
import { UpdateFolderUI } from './state/update-folder-ui.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LoadPersonalization } from 'src/app/core/stateUser/user-action';

/** Injection only in component */
@Injectable()
export class FolderService extends FeaturesEntitiesService<SmallFolder> implements OnDestroy {
  viewElements: QueryList<FolderComponent>;

  destroy = new Subject<void>();

  prevSortedFolderByTypeId: SortedByENUM = null;

  selectedIds: Set<string>;

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
      .subscribe((ids) => this.selectedIds = ids);

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

    this.murriService.dragEnd$.pipe(takeUntilDestroyed()).subscribe(flag => {
      if (flag) {
        this.syncPositions();
      }
    });
  }

  get isAnySelected(): boolean {
    return this.selectedIds.size > 0;
  }

  getIsSelected(id: string): boolean {
    if (this.selectedIds) {
      return this.selectedIds.has(id);
    }
    return false;
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

  async updateFolders(updates: UpdateFolderUI[]) {
    for (const value of updates) {
      const folder = this.entities.find((x) => x.id === value.id) as SmallFolder;
      if (folder !== undefined) {
        folder.color = value.color ?? folder.color;

        if (value.isUpdateTitle) {
          const viewChid = this.viewElements.toArray().find((x) => x.folder.id === value.id);
          if (viewChid) {
            viewChid.updateTitle(value.title);
          }
        }

        folder.isCanEdit = value.isCanEdit ?? folder.isCanEdit;
      }
    }
    if (updates.length > 0) {
      await this.store.dispatch(new ClearUpdatesUIFolders()).toPromise();
      await this.murriService.refreshLayoutAsync();
    }
  }

  syncPositions(): void {
    if (!this.isNeedUpdatePositions) return;
    const positions = this.murriService.getPositions();
    this.store.dispatch(new UpdatePositionsFolders(positions));
  }

  ngOnDestroy(): void {
    console.log('folder destroy');
    this.murriService.resetToDefaultOpacity();
    this.destroy.next();
    this.destroy.complete();
  }

  murriInitialise(refElements: QueryList<ElementRef>, isDragEnabled = true) {
    refElements.changes
      .pipe(takeUntil(this.destroy))
      .subscribe(async (q: QueryList<ElementRef>) => {
        if (this.needFirstInit()) {
          this.initState();
          // eslint-disable-next-line no-param-reassign
          isDragEnabled = isDragEnabled && this.isSortable;
          await this.murriService.initMurriFolderAsync(isDragEnabled);
          await this.setFirstInitedMurri();
          requestAnimationFrame(() => this.murriService.setOpacity1());
          await this.loadWithUpdates();
        }
        await this.synchronizeState(q.toArray());
      });
  }

  async loadWithUpdates() {
    const pr = this.store.selectSnapshot(UserStore.getPersonalizationSettings);
    this.updateService.foldersIds$.pipe(takeUntil(this.destroy)).subscribe(async (ids) => {
      if (ids.length > 0) {
        const folders = await this.apiFolders.getFoldersMany(ids, pr).toPromise();
        const actionsForUpdate = folders.map((folder) => new UpdateOneFolder(folder, folder.id));
        this.store.dispatch(actionsForUpdate);
        const transformFolders = this.transformSpread(folders);
        transformFolders.forEach((folder) => {
          const folderFinded = this.entities.find((x) => x.id === folder.id);
          if (folderFinded) {
            folderFinded.previewNotes = folder.previewNotes;
            this.loadAdditionInformation(ids);
          }
        });
        await this.murriService.refreshLayoutAsync();
        this.updateService.foldersIds$.next([]);
      }
    });
  }

  async loadAdditionInformation(folderIds?: string[]) {
    folderIds = folderIds ?? this.entities.map((x) => x.id);
    if (folderIds.length > 0) {
      const additionalInfo = await this.apiFolders.getAdditionalInfos(folderIds).toPromise();
      for (const info of additionalInfo) {
        const index = this.entities.findIndex((x) => x.id === info.folderId);
        if (index !== -1) {
          this.entities[index].additionalInfo = info;
        }
      }
      await this.murriService.refreshLayoutAsync();
    }
  }

  async changeOrderTypeHandler(sortType: SortedByENUM) {
    await this.resetLayoutAsync();
    const temp = this.transformSpread(this.entities);
    this.entities = this.orderBy(temp, sortType);
  }

  async loadFolders(typeENUM: FolderTypeENUM) {
    const pr = this.store.selectSnapshot(UserStore.getPersonalizationSettings);
    if(!pr) {
      await this.store.dispatch(LoadPersonalization).toPromise();
    }
    await this.store.dispatch(new LoadFolders(typeENUM, pr)).toPromise();

    const types = Object.values(FolderTypeENUM).filter(
      (q) => typeof q === 'number' && q !== typeENUM,
    );
    const actions = types.map((t: FolderTypeENUM) => new LoadFolders(t, pr));
    this.store.dispatch(actions);
  }

  async initializeEntities(folders: SmallFolder[]) {
    const tempFolders = this.transformSpread(folders);
    this.entities = this.orderBy(tempFolders, this.pageSortType);
    this.loadAdditionInformation();
  }
}
