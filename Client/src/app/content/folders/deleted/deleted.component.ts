import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { Store } from '@ngxs/store';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { takeUntil } from 'rxjs/operators';
import { LoadDeletedFolders, UnSelectAllFolder, LoadAllExceptFolders } from '../state/folders-actions';
import { FolderStore } from '../state/folders-state';
import { FolderType } from 'src/app/shared/enums/FolderTypes';
import { SpinnerChangeStatus, UpdateRoute } from 'src/app/core/stateApp/app-action';
import { EntityType } from 'src/app/shared/enums/EntityTypes';
import { FontSize } from 'src/app/shared/enums/FontSize';
import { MurriService } from 'src/app/shared/services/murri.service';
import { FolderService } from '../folder.service';

@Component({
  selector: 'app-deleted',
  templateUrl: './deleted.component.html',
  styleUrls: ['./deleted.component.scss'],
  providers: [FolderService]
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
    this.murriService.flagForOpacity = false;
    this.murriService.muuriDestroy();
    this.destroy.next();
    this.destroy.complete();
    this.store.dispatch(new UnSelectAllFolder());
  }

  async ngOnInit() {
    await this.store.dispatch(new UpdateRoute(EntityType.FolderDeleted)).toPromise();
    await this.store.dispatch(new SpinnerChangeStatus(true)).toPromise();
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

    const folders = this.store.selectSnapshot(FolderStore.deletedFolders);
    this.folderService.firstInit(folders);

    await this.pService.waitPreloading();
    this.store.dispatch(new SpinnerChangeStatus(false));
    this.loaded = true;
    this.murriService.initMurriFolderAsync(FolderType.Deleted);
    await this.murriService.setOpacityTrueAsync();
  }


}
