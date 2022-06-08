import {
  Component,
  OnInit,
  OnDestroy,
  ViewChildren,
  ElementRef,
  QueryList,
  AfterViewInit,
} from '@angular/core';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { Select, Store } from '@ngxs/store';
import { FolderTypeENUM } from 'src/app/shared/enums/folder-types.enum';
import { UpdateRoute } from 'src/app/core/stateApp/app-action';
import { EntityType } from 'src/app/shared/enums/entity-types.enum';
import { FontSizeENUM } from 'src/app/shared/enums/font-size.enum';
import { Observable } from 'rxjs';
import { FolderService } from '../folder.service';
import { UnSelectAllFolder } from '../state/folders-actions';
import { FolderStore } from '../state/folders-state';
import { SignalRService } from 'src/app/core/signal-r.service';
import { takeUntil } from 'rxjs/operators';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { ShortUser } from 'src/app/core/models/short-user.model';
import { BaseFoldersComponent } from '../base-folders-component';

@Component({
  selector: 'app-shared',
  templateUrl: './shared.component.html',
  styleUrls: ['./shared.component.scss'],
  providers: [FolderService],
})
export class SharedComponent
  extends BaseFoldersComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  @ViewChildren('item', { read: ElementRef }) refElements: QueryList<ElementRef>;

  @Select(FolderStore.sharedCount)
  sharedCount$: Observable<number>;

  @Select(UserStore.getUser)
  public user$: Observable<ShortUser>;

  fontSize = FontSizeENUM;

  loaded = false;

  constructor(
    public pService: PersonalizationService,
    private store: Store,
    folderService: FolderService,
    private signalRService: SignalRService,
  ) {
    super(folderService);
  }

  ngAfterViewInit(): void {
    this.folderService.murriInitialise(this.refElements, false);
  }

  ngOnDestroy(): void {
    this.store.dispatch(new UnSelectAllFolder());
  }

  async ngOnInit() {
    await this.store.dispatch(new UpdateRoute(EntityType.FolderShared)).toPromise();
    this.pService.setSpinnerState(true);
    await this.loadContent();
  }

  async loadContent() {
    await this.folderService.loadFolders(FolderTypeENUM.Shared);

    this.folderService.initializeEntities(this.folderService.getByCurrentType);

    await this.pService.waitPreloading();
    this.pService.setSpinnerState(false);
    this.loaded = true;

    this.signalRService.addFoldersToSharedEvent$
      .pipe(takeUntil(this.folderService.destroy))
      .subscribe((folders) => {
        if (folders && folders.length > 0) {
          this.folderService.addToDom(folders);
          this.signalRService.addFoldersToSharedEvent$.next([]);
        }
      });
  }
}
