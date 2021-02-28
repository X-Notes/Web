import { Component, OnInit, OnDestroy, ViewChildren, ElementRef, QueryList, AfterViewInit } from '@angular/core';
import { Subject } from 'rxjs';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { Store } from '@ngxs/store';
import { takeUntil } from 'rxjs/operators';
import { LoadFolders, UnSelectAllFolder } from '../state/folders-actions';
import { FolderStore } from '../state/folders-state';
import { FolderTypeENUM } from 'src/app/shared/enums/FolderTypesEnum';
import { UpdateRoute } from 'src/app/core/stateApp/app-action';
import { EntityType } from 'src/app/shared/enums/EntityTypes';
import { MurriService } from 'src/app/shared/services/murri.service';
import { FolderService } from '../folder.service';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { FontSizeENUM } from 'src/app/shared/enums/FontSizeEnum';

@Component({
  selector: 'app-deleted',
  templateUrl: './deleted.component.html',
  styleUrls: ['./deleted.component.scss'],
  providers: [FolderService]
})
export class DeletedComponent implements OnInit, OnDestroy, AfterViewInit {

  fontSize = FontSizeENUM;
  destroy = new Subject<void>();
  loaded = false;

  @ViewChildren('item', { read: ElementRef,  }) refElements: QueryList<ElementRef>;

  constructor(public pService: PersonalizationService,
              private store: Store,
              public murriService: MurriService,
              public folderService: FolderService) { }

  ngAfterViewInit(): void {
    this.folderService.murriInitialise(this.refElements, FolderTypeENUM.Deleted);
  }

  ngOnDestroy(): void {
    this.murriService.flagForOpacity = false;
    this.murriService.muuriDestroy();
    this.destroy.next();
    this.destroy.complete();
    this.store.dispatch(new UnSelectAllFolder());
  }

  async ngOnInit() {
    await this.store.dispatch(new UpdateRoute(EntityType.FolderDeleted)).toPromise();
    this.pService.setSpinnerState(true);
    this.store.select(AppStore.appLoaded)
    .pipe(takeUntil(this.destroy))
    .subscribe(async (x: boolean) => {
      if (x) {
        await this.loadContent();
      }
    }
    );
  }

  async loadContent() {
    const type = this.store.selectSnapshot(AppStore.getFolderTypes).find(x => x.name === FolderTypeENUM.Deleted);
    await this.folderService.loadFolders(type);

    let folders = this.store.selectSnapshot(FolderStore.deletedFolders);
    folders = this.folderService.transformFolders(folders);
    this.folderService.firstInit(folders);

    await this.pService.waitPreloading();
    this.pService.setSpinnerState(false);
    this.loaded = true;
  }


}
