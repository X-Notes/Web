/* eslint-disable no-return-assign */
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { UpdateRoute } from 'src/app/core/stateApp/app-action';
import { EntityType } from 'src/app/shared/enums/entity-types.enum';
import { Observable, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { takeUntil } from 'rxjs/operators';
import { ShortUser } from 'src/app/core/models/short-user.model';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { FolderTypeENUM } from 'src/app/shared/enums/folder-types.enum';
import { FontSizeENUM } from 'src/app/shared/enums/font-size.enum';
import { MatMenu } from '@angular/material/menu';
import { ThemeENUM } from 'src/app/shared/enums/theme.enum';
import { UpdaterEntitiesService } from 'src/app/core/entities-updater.service';
import { LoadFolders, LoadFullFolder } from '../state/folders-actions';
import { FolderStore } from '../state/folders-state';
import { FullFolder } from '../models/full-folder.model';
import { SmallFolder } from '../models/folder.model';
import { FullFolderNotesService } from './services/full-folder-notes.service';
import { DialogsManageService } from '../../navigation/dialogs-manage.service';
import { ApiFullFolderService } from './services/api-full-folder.service';
import { MenuButtonsService } from '../../navigation/menu-buttons.service';
import { ApiServiceNotes } from '../../notes/api-notes.service';
import { SelectIdNote } from '../../notes/state/notes-actions';
import { HtmlTitleService } from 'src/app/core/html-title.service';
import { WebSocketsFolderUpdaterService } from './services/web-sockets-folder-updater.service';

@Component({
  selector: 'app-full-folder',
  templateUrl: './full-folder.component.html',
  styleUrls: ['./full-folder.component.scss'],
  providers: [FullFolderNotesService, WebSocketsFolderUpdaterService],
})
export class FullFolderComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChildren('item', { read: ElementRef }) refElements: QueryList<ElementRef>;

  @ViewChild(MatMenu) menu: MatMenu;

  @Select(FolderStore.canView)
  public canView$: Observable<boolean>;

  @Select(FolderStore.canNoView)
  public canNoView$: Observable<boolean>;

  @Select(FolderStore.isOwner)
  public isOwner$: Observable<boolean>;

  @Select(UserStore.getUserBackground)
  public userBackground$: Observable<string>;

  @Select(UserStore.getUser)
  public user$: Observable<ShortUser>;

  fontSize = FontSizeENUM;

  foldersLink: SmallFolder[] = [];

  public folder: FullFolder;

  loaded = false;

  private routeSubscription: Subscription;

  private id: string;

  constructor(
    private store: Store,
    private route: ActivatedRoute,
    public pService: PersonalizationService,
    public ffnService: FullFolderNotesService,
    public dialogsService: DialogsManageService,
    private apiFullFolder: ApiFullFolderService,
    public menuButtonService: MenuButtonsService,
    public noteApiService: ApiServiceNotes,
    private updateNoteService: UpdaterEntitiesService,
    private router: Router,
    private htmlTitleService: HtmlTitleService,
    private webSocketsFolderUpdaterService: WebSocketsFolderUpdaterService
  ) {}

  ngAfterViewInit(): void {
    this.ffnService.murriInitialise(this.refElements);
    this.initPanelClassStyleSubscribe();
    this.webSocketsFolderUpdaterService.tryJoinToFolder(this.id);
  }

  ngOnDestroy(): void {
    this.webSocketsFolderUpdaterService.leaveFolder(this.id);
    this.updateNoteService.foldersIds$.next([
      ...this.updateNoteService.foldersIds$.getValue(),
      this.id,
    ]);
    this.routeSubscription.unsubscribe();
  }


  async ngOnInit() {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.pService.setSpinnerState(true);
    this.store.dispatch(new UpdateRoute(EntityType.FolderInner));

    this.routeSubscription = this.route.params.subscribe(async (params) => {
      this.id = params.id;
      this.store
        .select(AppStore.appLoaded)
        .pipe(takeUntil(this.ffnService.destroy)) // TODO MEMORY OPTIMIZATION, DO LIKE IN FULL NOTE
        .subscribe(async (x: boolean) => {
          if (x) {
            await this.loadFolder();

            if (this.folder) {
              const pr = this.store.selectSnapshot(UserStore.getPersonalizationSettings);
              const notes = await this.apiFullFolder.getFolderNotes(this.folder.id, pr).toPromise();
              await this.ffnService.initializeEntities(notes);
            }

            this.htmlTitleService.setCustomOrDefault(this.folder?.title, 'titles.folder');

            await this.pService.waitPreloading();
            this.pService.setSpinnerState(false);
            this.loaded = true;

            this.loadSideBar();
          }
        });
    });

    this.initManageButtonSubscribe();
    this.initHeaderButtonSubscribe();
  }

  get folderMenu() {
    const type = this.folder?.folderTypeId;
    if (type) {
      return this.menuButtonService.getFolderMenuByFolderType(type);
    }
    return [];
  }

  initHeaderButtonSubscribe() {
    this.pService.newButtonSubject
      .pipe(takeUntil(this.ffnService.destroy))
      .subscribe(async (flag) => {
        if (flag) {
          const newNote = await this.noteApiService.new().toPromise();
          const ids = [newNote.id, ...this.ffnService.entities.map((z) => z.id)];
          await this.apiFullFolder.updateNotesInFolder(ids, this.folder.id).toPromise();
          this.ffnService.addToDom([newNote]);
        }
      });

    this.pService.selectAllButton
      .pipe(takeUntil(this.ffnService.destroy))
      .subscribe(async (flag) => {
        if (flag) {
          const notes = this.ffnService.entities.filter(
            (x) => x.isSelected === false || x.isSelected === undefined, // TODO CHANGE
          );
          // eslint-disable-next-line no-param-reassign
          notes.forEach((x) => (x.isSelected = true));
          const actions = notes.map((x) => new SelectIdNote(x.id));
          this.store.dispatch(actions);
        }
      });
  }

  initPanelClassStyleSubscribe() {
    // TODO REMOVE KOSTIL
    this.store
      .select(UserStore.getUserTheme)
      .pipe(takeUntil(this.ffnService.destroy))
      .subscribe((theme) => {
        if (theme) {
          if (theme === ThemeENUM.Dark) {
            this.menu.panelClass = 'dark-menu';
          } else {
            this.menu.panelClass = null;
          }
        }
      });
  }

  initManageButtonSubscribe() {
    this.pService.manageNotesInFolderSubject
      .pipe(takeUntil(this.ffnService.destroy))
      .subscribe(() => {
        const instanse = this.dialogsService.openManageNotesInFolder();
        instanse
          .afterClosed()
          .pipe(takeUntil(this.ffnService.destroy))
          .subscribe(async (resp) => {
            if (resp) {
              const ids = resp.map((x) => x.id);
              await this.apiFullFolder.updateNotesInFolder(ids, this.folder.id).toPromise();
              await this.ffnService.updateNotesLayout(this.folder.id);
            }
          });
      });
  }

  async loadFolder() {
    await this.store.dispatch(new LoadFullFolder(this.id)).toPromise();
    this.store
      .select(FolderStore.full)
      .pipe(takeUntil(this.ffnService.destroy))
      .subscribe((folder) => (this.folder = folder));
  }

  async loadSideBar() {
    const pr = this.store.selectSnapshot(UserStore.getPersonalizationSettings);
    const types = Object.values(FolderTypeENUM).filter((z) => typeof z === 'number');
    const actions = types.map((action: FolderTypeENUM) => new LoadFolders(action, pr));
    await this.store.dispatch(actions).toPromise();
    if (this.folder?.folderTypeId) {
      await this.setSideBarNotes(this.folder.folderTypeId);
    }
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
}
