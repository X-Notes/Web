import { Component, OnInit, OnDestroy, ViewChildren, ElementRef, QueryList, AfterViewInit } from '@angular/core';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Store } from '@ngxs/store';
import { LoadPrivateFolders, UnSelectAllFolder, LoadAllExceptFolders } from '../state/folders-actions';
import { FolderStore } from '../state/folders-state';
import { FolderType } from 'src/app/shared/enums/FolderTypes';
import { UpdateRoute } from 'src/app/core/stateApp/app-action';
import { EntityType } from 'src/app/shared/enums/EntityTypes';
import { FontSize } from 'src/app/shared/enums/FontSize';
import { MurriService } from 'src/app/shared/services/murri.service';
import { FolderService } from '../folder.service';
import { AppStore } from 'src/app/core/stateApp/app-state';

@Component({
  selector: 'app-private',
  templateUrl: './private.component.html',
  styleUrls: ['./private.component.scss'],
  providers: [FolderService]
})
export class PrivateComponent implements OnInit, OnDestroy, AfterViewInit {

  fontSize = FontSize;
  destroy = new Subject<void>();
  loaded = false;

  @ViewChildren('item', { read: ElementRef,  }) refElements: QueryList<ElementRef>;

  constructor(public pService: PersonalizationService,
              private store: Store,
              public murriService: MurriService,
              public folderService: FolderService) { }

  ngAfterViewInit(): void {
    this.folderService.murriInitialise(this.refElements, FolderType.Private);
  }

  ngOnDestroy(): void {
    this.murriService.flagForOpacity = false;
    this.murriService.muuriDestroy();
    this.destroy.next();
    this.destroy.complete();
    this.store.dispatch(new UnSelectAllFolder());
  }

  async ngOnInit() {
    await this.store.dispatch(new UpdateRoute(EntityType.FolderPrivate)).toPromise();
    this.pService.setSpinnerState(true);
    this.store.select(AppStore.getTokenUpdated)
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

    let folders = this.store.selectSnapshot(FolderStore.privateFolders);
    folders = this.folderService.transformFolders(folders);
    this.folderService.firstInit(folders);

    await this.pService.waitPreloading();
    this.pService.setSpinnerState(false);
    this.loaded = true;

    this.store.select(FolderStore.foldersAddingPrivate)
      .pipe(takeUntil(this.destroy))
      .subscribe(x => this.folderService.addToDom(x));
  }


}
