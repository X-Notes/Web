import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { Folder } from '../models/folder';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { Store } from '@ngxs/store';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { takeUntil, take } from 'rxjs/operators';
import { LoadArchiveFolders, UnSelectAllFolder } from '../state/folders-actions';
import { FolderStore } from '../state/folders-state';
import { Order, OrderEntity } from 'src/app/shared/services/order.service';

@Component({
  selector: 'app-archive',
  templateUrl: './archive.component.html',
  styleUrls: ['./archive.component.scss']
})
export class ArchiveComponent implements OnInit, OnDestroy {

  destroy = new Subject<void>();

  folders: Folder[] = [];

  constructor(public pService: PersonalizationService,
              private store: Store) { }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
    this.store.dispatch(new UnSelectAllFolder());
  }

  ngOnInit(): void {
    this.store.select(UserStore.getStatus)
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

    this.store.select(FolderStore.archiveFolders).pipe(take(1))
      .subscribe(x => { this.folders = [...x].map(note => { note = { ...note }; return note; }); setTimeout(() => this.initMurri()); });
  }

  initMurri() {
    this.pService.gridSettings();
    this.pService.grid.on('dragEnd', async (item, event) => {
      console.log(item._element.id);
      const order: Order = {
        orderEntity: OrderEntity.Folder,
        position: item.getGrid().getItems().indexOf(item) + 1,
        entityId: item._element.id
      };
    });
  }

}
