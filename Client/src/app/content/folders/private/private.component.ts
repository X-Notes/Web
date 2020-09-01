import { Component, OnInit, OnDestroy } from '@angular/core';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { takeUntil, take } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Folder } from '../models/folder';
import { Store } from '@ngxs/store';
import { LoadPrivateFolders, UnSelectAllFolder, PositionFolder, LoadAllExceptFolders } from '../state/folders-actions';
import { UserStore } from 'src/app/core/stateUser/user-state';
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
  selector: 'app-private',
  templateUrl: './private.component.html',
  styleUrls: ['./private.component.scss']
})
export class PrivateComponent implements OnInit, OnDestroy {

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

    await this.store.dispatch(new UpdateRoute(EntityType.FolderPrivate)).toPromise();

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
    await this.store.dispatch(new LoadPrivateFolders()).toPromise();

    this.store.dispatch(new LoadAllExceptFolders(FolderType.Private));

    this.store.select(FolderStore.privateFolders).pipe(take(1))
      .subscribe(x => { this.folders = [...x].map(folder => { folder = { ...folder }; return folder; });
                        setTimeout(() => this.murriService.initMurriFolder(EntityType.FolderPrivate)); });

    this.store.select(FolderStore.updateColorEvent)
      .pipe(takeUntil(this.destroy))
      .subscribe(x => this.folderService.changeColorHandler(this.folders, x));

    this.store.select(FolderStore.removeFromMurriEvent)
      .pipe(takeUntil(this.destroy))
      .subscribe(x => this.delete(x));

    this.store.select(FolderStore.foldersAddingPrivate)
      .pipe(takeUntil(this.destroy))
      .subscribe(x => this.addToDom(x));
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
          this.pService.grid.add(el, {index : 0, layout: true});
        }
      }, 0);
    }
  }

}
