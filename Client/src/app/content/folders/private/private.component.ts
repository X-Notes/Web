import { Component, OnInit, OnDestroy } from '@angular/core';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { takeUntil, take } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Folder } from '../models/folder';
import { Store } from '@ngxs/store';
import { LoadPrivateFolders, UnSelectAllFolder, PositionFolder } from '../state/folders-actions';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { FolderStore } from '../state/folders-state';
import { Order, OrderEntity } from 'src/app/shared/services/order.service';
import { UpdateColor } from '../../notes/state/updateColor';
import { FolderType } from 'src/app/shared/enums/FolderTypes';
import {  UpdateRoute } from 'src/app/core/stateApp/app-action';
import { MenuButtonsService } from '../../navigation/menu-buttons.service';
import { EntityType } from 'src/app/shared/enums/EntityTypes';

@Component({
  selector: 'app-private',
  templateUrl: './private.component.html',
  styleUrls: ['./private.component.scss']
})
export class PrivateComponent implements OnInit, OnDestroy {

  destroy = new Subject<void>();

  folders: Folder[] = [];

  constructor(public pService: PersonalizationService,
              private store: Store) { }

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

    this.store.select(FolderStore.privateFolders).pipe(take(1))
      .subscribe(x => { this.folders = [...x].map(note => { note = { ...note }; return note; }); setTimeout(() => this.initMurri()); });

    this.store.select(FolderStore.updateColorEvent)
      .pipe(takeUntil(this.destroy))
      .subscribe(x => this.changeColorHandler(x));

    this.store.select(FolderStore.removeFromMurriEvent)
      .pipe(takeUntil(this.destroy))
      .subscribe(x => this.delete(x));

    this.store.select(FolderStore.foldersAddingPrivate)
      .pipe(takeUntil(this.destroy))
      .subscribe(x => this.addToDom(x));
  }

  initMurri() {
    this.pService.gridSettings('.grid-item');
    this.pService.grid.on('dragEnd', async (item, event) => {
      console.log(item._element.id);
      const order: Order = {
        orderEntity: OrderEntity.Folder,
        position: item.getGrid().getItems().indexOf(item) + 1,
        entityId: item._element.id
      };
      this.store.dispatch(new PositionFolder(order, EntityType.FolderPrivate));
    });
  }

  delete(ids: string[]) {
    if (ids.length > 0) {
      this.folders = this.folders.filter(x => ids.indexOf(x.id) !== -1 ? false : true);
      setTimeout(() => this.pService.grid.refreshItems().layout(), 0);
    }
  }

  changeColorHandler(updateColor: UpdateColor[]) {
    for (const update of updateColor) {
      this.folders.find(x => x.id === update.id).color = update.color;
    }
  }

  addToDom(folders: Folder[]) {
    if (folders.length > 0) {
      this.folders = [...folders, ...this.folders];
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
