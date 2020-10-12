import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { Folder } from '../models/folder';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { Store } from '@ngxs/store';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { takeUntil, take } from 'rxjs/operators';
import { FolderStore } from '../state/folders-state';
import { LoadSharedFolders, UnSelectAllFolder, PositionFolder, LoadAllExceptFolders } from '../state/folders-actions';
import { Order, OrderEntity } from 'src/app/shared/services/order.service';
import { UpdateColor } from '../../notes/state/updateColor';
import { FolderType } from 'src/app/shared/enums/FolderTypes';
import { UpdateRoute } from 'src/app/core/stateApp/app-action';
import { EntityType } from 'src/app/shared/enums/EntityTypes';
import { FontSize } from 'src/app/shared/enums/FontSize';
import { MurriService } from 'src/app/shared/services/murri.service';
import { FolderService } from '../folder.service';

@Component({
  selector: 'app-shared',
  templateUrl: './shared.component.html',
  styleUrls: ['./shared.component.scss']
})
export class SharedComponent implements OnInit, OnDestroy {

  fontSize = FontSize;
  destroy = new Subject<void>();

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
    this.murriService.flagForOpacity = false;
    await this.store.dispatch(new UpdateRoute(EntityType.FolderShared)).toPromise();

    this.store.dispatch(new LoadAllExceptFolders(FolderType.Shared));

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
    await this.store.dispatch(new LoadSharedFolders()).toPromise();

    this.store.select(FolderStore.sharedFolders).pipe(take(1))
      .subscribe(x => { this.folderService.folders = [...x].map(note => { note = { ...note }; return note; });
                        setTimeout(() => this.murriService.initMurriFolder(EntityType.FolderShared)); });

  }

}
