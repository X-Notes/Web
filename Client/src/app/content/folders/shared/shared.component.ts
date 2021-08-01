import {
  Component,
  OnInit,
  OnDestroy,
  ViewChildren,
  ElementRef,
  QueryList,
  AfterViewInit,
} from '@angular/core';
import { Subject } from 'rxjs';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { Store } from '@ngxs/store';
import { takeUntil } from 'rxjs/operators';
import { FolderTypeENUM } from 'src/app/shared/enums/folder-types.enum';
import { UpdateRoute } from 'src/app/core/stateApp/app-action';
import { EntityType } from 'src/app/shared/enums/entity-types.enum';
import { MurriService } from 'src/app/shared/services/murri.service';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { FontSizeENUM } from 'src/app/shared/enums/font-size.enum';
import { FolderService } from '../folder.service';
import { UnSelectAllFolder } from '../state/folders-actions';
import { FolderStore } from '../state/folders-state';

@Component({
  selector: 'app-shared',
  templateUrl: './shared.component.html',
  styleUrls: ['./shared.component.scss'],
  providers: [FolderService],
})
export class SharedComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChildren('item', { read: ElementRef }) refElements: QueryList<ElementRef>;

  fontSize = FontSizeENUM;

  loaded = false;

  constructor(
    public pService: PersonalizationService,
    private store: Store,
    public murriService: MurriService,
    public folderService: FolderService,
  ) {}

  ngAfterViewInit(): void {
    this.folderService.murriInitialise(this.refElements, FolderTypeENUM.Shared, false);
  }

  ngOnDestroy(): void {
    this.murriService.flagForOpacity = false;
    this.murriService.muuriDestroy();
    this.store.dispatch(new UnSelectAllFolder());
  }

  async ngOnInit() {
    await this.store.dispatch(new UpdateRoute(EntityType.FolderShared)).toPromise();
    this.pService.setSpinnerState(true);
    this.pService.setIllustrationState(false);
    this.store
      .select(AppStore.appLoaded)
      .pipe(takeUntil(this.folderService.destroy))
      .subscribe(async (x: boolean) => {
        if (x) {
          await this.loadContent();
        }
      });
  }

  async loadContent() {
    await this.folderService.loadFolders(FolderTypeENUM.Shared);

    this.folderService.initializeEntities(this.folderService.getByCurrentType);

    await this.pService.waitPreloading();
    this.pService.setSpinnerState(false);
    this.loaded = true;

    this.store
      .select(FolderStore.sharedCount)
      .pipe(takeUntil(this.folderService.destroy))
      .subscribe((x) => {
        if (!x) {
          this.pService.setIllustrationState(true);
        }
      });
  }
}
