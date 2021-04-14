import { Component, OnDestroy, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { UpdateRoute } from 'src/app/core/stateApp/app-action';
import { EntityType } from 'src/app/shared/enums/EntityTypes';
import { MurriService } from 'src/app/shared/services/murri.service';
import { Observable, Subject, Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { takeUntil } from 'rxjs/operators';
import { ShortUser } from 'src/app/core/models/short-user';
import { UserStore } from 'src/app/core/stateUser/user-state';
import {
  PersonalizationService,
  sideBarCloseOpen,
} from 'src/app/shared/services/personalization.service';
import { FolderTypeENUM } from 'src/app/shared/enums/FolderTypesEnum';
import { LoadFolders, LoadFullFolder } from '../state/folders-actions';
import { FolderStore } from '../state/folders-state';
import { FullFolder } from '../models/FullFolder';
import { SmallFolder } from '../models/folder';

@Component({
  selector: 'app-full-folder',
  templateUrl: './full-folder.component.html',
  styleUrls: ['./full-folder.component.scss'],
  animations: [sideBarCloseOpen],
})
export class FullFolderComponent implements OnInit, OnDestroy {
  folder: FullFolder;

  // eslint-disable-next-line @typescript-eslint/member-ordering
  @Select(UserStore.getUser)
  public user$: Observable<ShortUser>;

  public photoError = false;

  destroy = new Subject<void>();

  foldersLink: SmallFolder[] = [];

  private routeSubscription: Subscription;

  private id: string;

  constructor(
    private store: Store,
    public murriService: MurriService,
    private route: ActivatedRoute,
    public pService: PersonalizationService,
  ) {}

  ngOnDestroy(): void {
    this.murriService.flagForOpacity = false;
    this.destroy.next();
    this.destroy.complete();
    this.routeSubscription.unsubscribe();
  }

  async ngOnInit() {
    this.store.dispatch(new UpdateRoute(EntityType.FolderInner));

    this.routeSubscription = this.route.params.subscribe(async (params) => {
      this.id = params.id;

      this.store
        .select(AppStore.appLoaded)
        .pipe(takeUntil(this.destroy))
        .subscribe(async (x: boolean) => {
          if (x) {
            await this.store.dispatch(new LoadFullFolder(this.id)).toPromise();
            this.folder = this.store.selectSnapshot(FolderStore.full);
            const types = this.store.selectSnapshot(AppStore.getFolderTypes);
            const actions = types.map((action) => new LoadFolders(action.id, action));
            await this.store.dispatch(actions).toPromise();
            await this.setSideBarNotes(this.folder.folderType.name);
          }
        });
    });
  }

  setSideBarNotes(folderType: FolderTypeENUM) {
    let folders: SmallFolder[];
    switch (folderType) {
      case FolderTypeENUM.Deleted: {
        folders = this.store.selectSnapshot(FolderStore.deletedFolders);
        break;
      }
      case FolderTypeENUM.Private: {
        folders = this.store.selectSnapshot(FolderStore.privateFolders);
        break;
      }
      case FolderTypeENUM.Shared: {
        folders = this.store.selectSnapshot(FolderStore.sharedFolders);
        break;
      }
      case FolderTypeENUM.Archive: {
        folders = this.store.selectSnapshot(FolderStore.archiveFolders);
        break;
      }
      default: {
        throw new Error('error');
      }
    }
    this.foldersLink = folders.filter((z) => z.id !== this.id);
    console.log(this.foldersLink);
  }

  changeSource() {
    this.photoError = true;
  }
}
