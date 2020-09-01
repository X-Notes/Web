import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { Folder } from '../models/folder';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { Store } from '@ngxs/store';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { takeUntil, take } from 'rxjs/operators';
import { LoadArchiveFolders, UnSelectAllFolder, PositionFolder, LoadAllExceptFolders } from '../state/folders-actions';
import { FolderStore } from '../state/folders-state';
import { Order, OrderEntity } from 'src/app/shared/services/order.service';
import { UpdateColor } from '../../notes/state/updateColor';
import { FolderType } from 'src/app/shared/enums/FolderTypes';
import {  UpdateRoute } from 'src/app/core/stateApp/app-action';
import { EntityType } from 'src/app/shared/enums/EntityTypes';
import { FontSize } from 'src/app/shared/enums/FontSize';
import { MurriService } from 'src/app/shared/services/murri.service';
import { FolderService } from '../folder.service';

@Component({
  selector: 'app-archive',
  templateUrl: './archive.component.html',
  styleUrls: ['./archive.component.scss']
})
export class ArchiveComponent implements OnInit, OnDestroy {

  fontSize = FontSize;
  destroy = new Subject<void>();

  folders: Folder[] = [];

  constructor(public pService: PersonalizationService,
              private store: Store,
              private murriService: MurriService,
              private folderService: FolderService) { }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
    this.store.dispatch(new UnSelectAllFolder());
  }

  async ngOnInit() {

    await this.store.dispatch(new UpdateRoute(EntityType.FolderArchive)).toPromise();

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
    await this.store.dispatch(new LoadArchiveFolders()).toPromise();

    this.store.dispatch(new LoadAllExceptFolders(FolderType.Archive));

    this.store.select(FolderStore.archiveFolders).pipe(take(1))
      .subscribe(x => { this.folders = [...x].map(note => { note = { ...note }; return note; });
                        setTimeout(() => this.murriService.initMurriFolder(EntityType.FolderArchive)); });

    this.store.select(FolderStore.updateColorEvent)
      .pipe(takeUntil(this.destroy))
      .subscribe(x => this.folderService.changeColorHandler(this.folders, x));

    this.store.select(FolderStore.removeFromMurriEvent)
      .pipe(takeUntil(this.destroy))
      .subscribe(x => this.delete(x));
  }

  delete(ids: string[]) {
    if (ids.length > 0) {
      this.folders = this.folders.filter(x => ids.indexOf(x.id) !== -1 ? false : true);
      setTimeout(() => this.pService.grid.refreshItems().layout(), 0);
    }
  }


}
