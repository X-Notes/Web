import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { Folder } from '../models/folder';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { Store } from '@ngxs/store';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { takeUntil, take } from 'rxjs/operators';
import { LoadDeletedFolders, UnSelectAllFolder, PositionFolder, LoadAllExceptFolders } from '../state/folders-actions';
import { FolderStore } from '../state/folders-state';
import { Order, OrderEntity } from 'src/app/shared/services/order.service';
import { UpdateColor } from '../../notes/state/updateColor';
import { FolderType } from 'src/app/shared/enums/FolderTypes';
import { UpdateRoute } from 'src/app/core/stateApp/app-action';
import { EntityType } from 'src/app/shared/enums/EntityTypes';
import { FontSize } from 'src/app/shared/enums/FontSize';
import { MurriService } from 'src/app/shared/services/murri.service';
import { FolderService } from '../folder.service';

@Component({
  selector: 'app-deleted',
  templateUrl: './deleted.component.html',
  styleUrls: ['./deleted.component.scss'],
  providers: [MurriService]
})
export class DeletedComponent implements OnInit, OnDestroy {

  fontSize = FontSize;
  destroy = new Subject<void>();
  loaded = false;

  constructor(public pService: PersonalizationService,
              private store: Store,
              public murriService: MurriService,
              public folderService: FolderService) { }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
    this.store.dispatch(new UnSelectAllFolder());
  }

  async ngOnInit() {
    await this.store.dispatch(new UpdateRoute(EntityType.FolderDeleted)).toPromise();

    this.store.select(UserStore.getTokenUpdated)
    .pipe(takeUntil(this.destroy))
    .subscribe(async (x: boolean) => {
      if (x) {
        await this.loadContent();
      }
    }
    );
  }

  async loadContent() {
    await this.store.dispatch(new LoadDeletedFolders()).toPromise();

    this.store.dispatch(new LoadAllExceptFolders(FolderType.Deleted));

    this.store.select(FolderStore.deletedFolders).pipe(take(1))
      .subscribe(async (x) => {
        this.folderService.folders = [...x].map(note => { note = { ...note }; return note; });
        this.loaded =  await this.initPromise();
        setTimeout(() => this.murriService.initMurriFolder(EntityType.FolderDeleted)); });
  }

  initPromise() {
    return new Promise<boolean>((resolve, rej) => setTimeout(() => resolve(true), this.pService.timeForSpinnerLoading));
  }

}
