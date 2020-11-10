import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { Store } from '@ngxs/store';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { takeUntil, take } from 'rxjs/operators';
import { FolderStore } from '../state/folders-state';
import { LoadSharedFolders, UnSelectAllFolder, LoadAllExceptFolders } from '../state/folders-actions';
import { FolderType } from 'src/app/shared/enums/FolderTypes';
import { SpinnerChangeStatus, UpdateRoute } from 'src/app/core/stateApp/app-action';
import { EntityType } from 'src/app/shared/enums/EntityTypes';
import { FontSize } from 'src/app/shared/enums/FontSize';
import { MurriService } from 'src/app/shared/services/murri.service';
import { FolderService } from '../folder.service';

@Component({
  selector: 'app-shared',
  templateUrl: './shared.component.html',
  styleUrls: ['./shared.component.scss'],
  providers: [FolderService]
})
export class SharedComponent implements OnInit, OnDestroy {

  fontSize = FontSize;
  destroy = new Subject<void>();
  loaded = false;

  constructor(public pService: PersonalizationService,
              private store: Store,
              public murriService: MurriService,
              public folderService: FolderService) { }

  ngOnDestroy(): void {
    this.murriService.flagForOpacity = false;
    this.murriService.muuriDestroy();
    this.destroy.next();
    this.destroy.complete();
    this.store.dispatch(new UnSelectAllFolder());
  }

  async ngOnInit() {
    await this.store.dispatch(new UpdateRoute(EntityType.FolderShared)).toPromise();
    await this.store.dispatch(new SpinnerChangeStatus(true)).toPromise();
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

    const folders = this.store.selectSnapshot(FolderStore.sharedFolders);
    this.folderService.firstInit(folders);

    const active = await this.pService.disableSpinnerPromise();
    this.store.dispatch(new SpinnerChangeStatus(active));
    this.loaded = true;
    this.murriService.initMurriFolderAsync(FolderType.Shared);


  }


}
