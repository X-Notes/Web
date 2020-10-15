import { Component, OnInit, OnDestroy } from '@angular/core';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { takeUntil, take } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Store } from '@ngxs/store';
import { LoadPrivateFolders, UnSelectAllFolder, LoadAllExceptFolders } from '../state/folders-actions';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { FolderStore } from '../state/folders-state';
import { FolderType } from 'src/app/shared/enums/FolderTypes';
import {  UpdateRoute } from 'src/app/core/stateApp/app-action';
import { EntityType } from 'src/app/shared/enums/EntityTypes';
import { FontSize } from 'src/app/shared/enums/FontSize';
import { MurriService } from 'src/app/shared/services/murri.service';
import { FolderService } from '../folder.service';

@Component({
  selector: 'app-private',
  templateUrl: './private.component.html',
  styleUrls: ['./private.component.scss'],
  providers: [FolderService]
})
export class PrivateComponent implements OnInit, OnDestroy {

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
      .subscribe(async (x) => {
        this.folderService.firstInit(x);
        this.loaded =  await this.initPromise();
        setTimeout(() => this.murriService.initMurriFolder(EntityType.FolderPrivate)); });

    this.store.select(FolderStore.foldersAddingPrivate)
      .pipe(takeUntil(this.destroy))
      .subscribe(x => this.folderService.addToDom(x));
  }

  initPromise() {
    return new Promise<boolean>((resolve, rej) => setTimeout(() => resolve(true), this.pService.timeForSpinnerLoading));
  }

}
