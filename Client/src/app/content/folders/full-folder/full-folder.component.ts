import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
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
import { FontSizeENUM } from 'src/app/shared/enums/FontSizeEnum';
import { LoadFolders, LoadFullFolder } from '../state/folders-actions';
import { FolderStore } from '../state/folders-state';
import { FullFolder } from '../models/FullFolder';
import { SmallFolder } from '../models/folder';
import { FullFolderNotesService } from './services/full-folder-notes.service';
import { DialogsManageService } from '../../navigation/dialogs-manage.service';
import { ApiFullFolderService } from './services/api-full-folder.service';
import { NotesService } from '../../notes/notes.service';

@Component({
  selector: 'app-full-folder',
  templateUrl: './full-folder.component.html',
  styleUrls: ['./full-folder.component.scss'],
  animations: [sideBarCloseOpen],
  providers: [FullFolderNotesService, NotesService],
})
export class FullFolderComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChildren('item', { read: ElementRef }) refElements: QueryList<ElementRef>;

  @Select(UserStore.getUserBackground)
  public userBackground$: Observable<ShortUser>;

  @Select(UserStore.getUser)
  public user$: Observable<ShortUser>;

  public photoError = false;

  fontSize = FontSizeENUM;

  destroy = new Subject<void>();

  foldersLink: SmallFolder[] = [];

  folder: FullFolder;

  loaded = false;

  private routeSubscription: Subscription;

  private id: string;

  constructor(
    private store: Store,
    public murriService: MurriService,
    private route: ActivatedRoute,
    public pService: PersonalizationService,
    public ffnService: FullFolderNotesService,
    private dialogsService: DialogsManageService,
    private apiFullFolder: ApiFullFolderService,
    public noteService: NotesService,
  ) {}

  ngAfterViewInit(): void {
    this.ffnService.murriInitialise(this.refElements);
  }

  ngOnDestroy(): void {
    this.murriService.flagForOpacity = false;
    this.murriService.muuriDestroy();
    this.destroy.next();
    this.destroy.complete();
    this.routeSubscription.unsubscribe();
  }

  async ngOnInit() {
    this.pService.setSpinnerState(true);
    this.store.dispatch(new UpdateRoute(EntityType.FolderInner));

    this.routeSubscription = this.route.params.subscribe(async (params) => {
      this.id = params.id;
      this.store
        .select(AppStore.appLoaded)
        .pipe(takeUntil(this.destroy))
        .subscribe(async (x: boolean) => {
          if (x) {
            await this.loadFolder();
            await this.ffnService.loadNotes(this.folder.id);

            await this.pService.waitPreloading();
            this.pService.setSpinnerState(false);
            this.loaded = true;
            this.loadSideBar();
          }
        });
    });

    this.initManageButtonSubscribe();
  }

  async initManageButtonSubscribe() {
    this.pService.manageNotesInFolderSubject.pipe(takeUntil(this.destroy)).subscribe(() => {
      const instanse = this.dialogsService.openManageNotesInFolder();
      instanse
        .afterClosed()
        .pipe(takeUntil(this.destroy))
        .subscribe(async (resp) => {
          if (resp) {
            const ids = resp.map((x) => x.id);
            await this.apiFullFolder.updateNotesInFolder(ids, this.folder.id).toPromise();
            await this.ffnService.loadNotes(this.folder.id);
          }
        });
    });
  }

  async loadFolder() {
    await this.store.dispatch(new LoadFullFolder(this.id)).toPromise();
    this.folder = this.store.selectSnapshot(FolderStore.full);
  }

  async loadSideBar() {
    const types = this.store.selectSnapshot(AppStore.getFolderTypes);
    const actions = types.map((action) => new LoadFolders(action.id, action));
    await this.store.dispatch(actions).toPromise();
    await this.setSideBarNotes(this.folder.folderType.name);
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
  }

  changeSource() {
    this.photoError = true;
  }
}
