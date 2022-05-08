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
import { Observable, Subject, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { ShortUser } from 'src/app/core/models/short-user.model';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { FolderTypeENUM } from 'src/app/shared/enums/folder-types.enum';
import { FontSizeENUM } from 'src/app/shared/enums/font-size.enum';
import { MatMenu } from '@angular/material/menu';
import { ThemeENUM } from 'src/app/shared/enums/theme.enum';
import { UpdaterEntitiesService } from 'src/app/core/entities-updater.service';
import { HtmlTitleService } from 'src/app/core/html-title.service';
import { FolderStore } from '../state/folders-state';
import { FullFolder } from '../models/full-folder.model';
import { SmallFolder } from '../models/folder.model';
import { FullFolderNotesService } from './services/full-folder-notes.service';
import { DialogsManageService } from '../../navigation/services/dialogs-manage.service';
import { ApiFullFolderService } from './services/api-full-folder.service';
import { ApiServiceNotes } from '../../notes/api-notes.service';
import { SelectIdNote, SetFolderNotes, UnSelectAllNote } from '../../notes/state/notes-actions';
import { WebSocketsFolderUpdaterService } from './services/web-sockets-folder-updater.service';
import { updateTitleEntitesDelay } from 'src/app/core/defaults/bounceDelay';
import { EntityPopupType } from 'src/app/shared/models/entity-popup-type.enum';
import { NoteStore } from '../../notes/state/notes-state';
import { MenuButtonsService } from '../../navigation/services/menu-buttons.service';
import { UpdateFolderTitle, LoadFullFolder, LoadFolders } from '../state/folders-actions';
import { PermissionsButtonsService } from '../../navigation/services/permissions-buttons.service';
import { SignalRService } from 'src/app/core/signal-r.service';
import { LoadLabels } from '../../labels/state/labels-actions';

@Component({
  selector: 'app-full-folder',
  templateUrl: './full-folder.component.html',
  styleUrls: ['./full-folder.component.scss'],
  providers: [FullFolderNotesService, WebSocketsFolderUpdaterService],
})
export class FullFolderComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChildren('item', { read: ElementRef }) refElements: QueryList<ElementRef>;

  @ViewChild(MatMenu) menu: MatMenu;

  @Select(FolderStore.canEdit)
  public canEdit$: Observable<boolean>;

  @Select(FolderStore.full)
  public folder$: Observable<FullFolder>;

  @Select(UserStore.getUserBackground)
  public userBackground$: Observable<string>;

  @Select(UserStore.getUser)
  public user$: Observable<ShortUser>;

  fontSize = FontSizeENUM;

  foldersLink: SmallFolder[] = [];

  loaded = false;

  nameChanged: Subject<string> = new Subject<string>();

  private routeSubscription: Subscription;

  private folderId: string;

  constructor(
    private store: Store,
    private route: ActivatedRoute,
    private router: Router,
    public pService: PersonalizationService,
    public ffnService: FullFolderNotesService,
    public dialogsService: DialogsManageService,
    private apiFullFolder: ApiFullFolderService,
    public menuButtonService: MenuButtonsService,
    public noteApiService: ApiServiceNotes,
    private updateNoteService: UpdaterEntitiesService,
    private htmlTitleService: HtmlTitleService,
    private webSocketsFolderUpdaterService: WebSocketsFolderUpdaterService,
    public pB: PermissionsButtonsService,
    private signalR: SignalRService,
  ) {}

  getFolderMenu(folder: FullFolder) {
    if (!folder) return [];
    return this.menuButtonService.getFolderMenuByFolderType(folder.folderTypeId);
  }

  ngAfterViewInit(): void {
    this.ffnService.murriInitialise(this.refElements);
    this.initPanelClassStyleSubscribe();
  }

  navigateToFolder(folderId: string): void {
    this.store.dispatch(UnSelectAllNote);
    this.router.navigate(['/folders/', folderId]);
  }

  ngOnDestroy(): void {
    this.store.dispatch(UnSelectAllNote);
    this.ffnService.onDestroy();
    this.webSocketsFolderUpdaterService.leaveFolder(this.folderId);
    this.updateNoteService.addFolderToUpdate(this.folderId);
    this.routeSubscription.unsubscribe();
  }

  changeNameSubscribtion() {
    this.nameChanged
      .pipe(takeUntil(this.ffnService.destroy), debounceTime(updateTitleEntitesDelay))
      .subscribe((title) => {
        this.store.dispatch(new UpdateFolderTitle(title, this.folderId));
        this.htmlTitleService.setCustomOrDefault(title, 'titles.folder');
      });
  }

  openChangeColorPopup() {
    const ids = [this.store.selectSnapshot(FolderStore.full).id];
    return this.dialogsService.openChangeColorDialog(EntityPopupType.Folder, ids);
  }

  async ngOnInit() {
    this.store.dispatch(new LoadLabels());
    this.pService.setSpinnerState(true);
    this.store.dispatch(new UpdateRoute(EntityType.FolderInner));
    this.changeNameSubscribtion();
    this.routeSubscription = this.route.params.subscribe(async (params) => {
      // REINIT LAYOUT
      let isReinit = false;
      if (this.folderId) {
        await this.ffnService.reinitLayout();
        isReinit = true;
        this.webSocketsFolderUpdaterService.leaveFolder(this.folderId);
      }
      // lOAD FOLDER
      this.folderId = params.id;
      await this.store.dispatch(new LoadFullFolder(this.folderId)).toPromise();

      // INIT FOLDER NOTES
      const pr = this.store.selectSnapshot(UserStore.getPersonalizationSettings);
      const notes = await this.apiFullFolder.getFolderNotes(this.folderId, pr).toPromise();
      await this.ffnService.initializeEntities(notes, this.folderId);
      this.updateState();

      if (isReinit) {
        await this.ffnService.murriService.initFolderNotesAsync();
        await this.ffnService.murriService.setOpacityFlagAsync(0);
      }

      // WS UPDATES
      this.signalR.updateFolder$.pipe(takeUntil(this.ffnService.destroy)).subscribe(async (x) => {
        await this.ffnService.handlerUpdates(x);
        this.updateState();
      });

      await this.pService.waitPreloading();
      this.pService.setSpinnerState(false);
      this.loaded = true;

      this.loadSideBar();

      const title = this.store.selectSnapshot(FolderStore.full)?.title;
      this.htmlTitleService.setCustomOrDefault(title, 'titles.folder');

      this.webSocketsFolderUpdaterService.tryJoinToFolder(this.folderId);
    });

    this.initManageButtonSubscribe();
    this.initHeaderButtonSubscribe();
  }

  initHeaderButtonSubscribe() {
    this.pService.newButtonSubject
      .pipe(takeUntil(this.ffnService.destroy))
      .subscribe(async (flag) => {
        if (flag) {
          const newNote = await this.noteApiService.new().toPromise();
          await this.apiFullFolder.addNotesToFolder([newNote.id], this.folderId).toPromise();
          this.ffnService.addToDom([newNote]);
          this.updateState();
        }
      });

    this.pService.selectAllButton
      .pipe(takeUntil(this.ffnService.destroy))
      .subscribe(async (flag) => {
        if (flag) {
          const notes = this.ffnService.entities.filter((x) => !x.isSelected);
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
    this.pService.addNotesToFolderSubject.pipe(takeUntil(this.ffnService.destroy)).subscribe(() => {
      const instanse = this.dialogsService.openAddNotesToFolder();
      instanse
        .afterClosed()
        .pipe(takeUntil(this.ffnService.destroy))
        .subscribe(async (resp) => {
          if (resp) {
            const ids = resp.map((x) => x.id);
            await this.apiFullFolder.addNotesToFolder(ids, this.folderId).toPromise();
            await this.ffnService.handleAdding(ids);
            this.updateState();
          }
        });
    });

    this.pService.removeNotesToFolderSubject
      .pipe(takeUntil(this.ffnService.destroy))
      .subscribe(async () => {
        const ids = this.store.selectSnapshot(NoteStore.selectedIds);
        const res = await this.apiFullFolder.removeNotesFromFolder(ids, this.folderId).toPromise();
        if (res.success) {
          this.ffnService.deleteFromDom(ids);
          this.updateState();
        }
        this.store.dispatch(UnSelectAllNote);
      });
  }

  updateState(): void {
    const isHasEntities = this.ffnService.entities?.length > 0;
    this.pService.isInnerFolderSelectAllActive$.next(isHasEntities);
    const mappedNotes = this.ffnService.entities.map((x) => ({ ...x }));
    this.store.dispatch(new SetFolderNotes(mappedNotes));
  }

  async loadSideBar() {
    const pr = this.store.selectSnapshot(UserStore.getPersonalizationSettings);
    const types = Object.values(FolderTypeENUM).filter((z) => typeof z === 'number');
    const actions = types.map((action: FolderTypeENUM) => new LoadFolders(action, pr));
    await this.store.dispatch(actions).toPromise();
    const folderType = this.store.selectSnapshot(FolderStore.full).folderTypeId;
    if (folderType) {
      await this.setSideBarNotes(folderType);
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
    this.foldersLink = folders.filter((z) => z.id !== this.folderId);
  }
}
