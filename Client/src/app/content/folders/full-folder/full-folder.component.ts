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
import { Actions, ofActionDispatched, Select, Store } from '@ngxs/store';
import { UpdateRoute } from 'src/app/core/stateApp/app-action';
import { EntityType } from 'src/app/shared/enums/entity-types.enum';
import { Observable, Subject, Subscription, interval } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { ShortUser } from 'src/app/core/models/user/short-user.model';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { FolderTypeENUM } from 'src/app/shared/enums/folder-types.enum';
import { EntitiesSizeENUM } from 'src/app/shared/enums/font-size.enum';
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
import {
  CreateNote,
  CreateNoteCompleted,
  SelectIdsNote,
  SetFolderNotes,
  UnSelectAllNote,
} from '../../notes/state/notes-actions';
import { WebSocketsFolderUpdaterService } from './services/web-sockets-folder-updater.service';
import { syncFolderStateIntervalDelay, updateTitleEntitesDelay } from 'src/app/core/defaults/bounceDelay';
import { EntityPopupType } from 'src/app/shared/models/entity-popup-type.enum';
import { NoteStore } from '../../notes/state/notes-state';
import { MenuButtonsService } from '../../navigation/services/menu-buttons.service';
import { UpdateFolderTitle, LoadFullFolder, LoadFolders, UpdateFullFolder } from '../state/folders-actions';
import { PermissionsButtonsService } from '../../navigation/services/permissions-buttons.service';
import { SignalRService } from 'src/app/core/signal-r.service';
import { LoadLabels } from '../../labels/state/labels-actions';
import { ApiBrowserTextService } from '../../notes/api-browser-text.service';
import { Icons } from 'src/app/shared/enums/icons.enum';
import { DestroyComponentService } from 'src/app/shared/services/destroy-component.service';

@Component({
  selector: 'app-full-folder',
  templateUrl: './full-folder.component.html',
  styleUrls: ['./full-folder.component.scss'],
  providers: [FullFolderNotesService, WebSocketsFolderUpdaterService, DestroyComponentService],
})
export class FullFolderComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChildren('item', { read: ElementRef }) refElements: QueryList<ElementRef>;

  @ViewChild('folderTitle', { read: ElementRef }) folderTitleEl: ElementRef<HTMLInputElement>;

  @ViewChild(MatMenu) menu: MatMenu;

  @Select(UserStore.getUserFontSize)
  public fontSize$?: Observable<EntitiesSizeENUM>;

  @Select(FolderStore.canEdit)
  public canEdit$: Observable<boolean>;

  @Select(FolderStore.full)
  public folder$: Observable<FullFolder>;

  @Select(FolderStore.fullFolderTitle)
  folderTitle$: Observable<string>;

  @Select(UserStore.getUserBackground)
  public userBackground$: Observable<string>;

  @Select(UserStore.getUser)
  public user$: Observable<ShortUser>;

  @Select(UserStore.getUserTheme)
  public theme$: Observable<ThemeENUM>;

  fontSize = EntitiesSizeENUM;

  foldersLink: SmallFolder[] = [];

  folderLoaded = false;

  folderEntitiesLoaded = false;

  icons = Icons;

  theme = ThemeENUM;

  // TITLE
  title: string;

  uiTitle: string;

  titleChange$: Subject<string> = new Subject<string>();

  //

  intervalSyncFolderState = interval(syncFolderStateIntervalDelay);

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
    private updateNoteService: UpdaterEntitiesService,
    private htmlTitleService: HtmlTitleService,
    private webSocketsFolderUpdaterService: WebSocketsFolderUpdaterService,
    public pB: PermissionsButtonsService,
    private signalR: SignalRService,
    private apiBrowserFunctions: ApiBrowserTextService,
    private actions$: Actions,
  ) { }

  get isCanEdit(): boolean {
    return this.store.selectSnapshot(FolderStore.canEdit);
  }

  initTitle() {
    const folder = this.store.selectSnapshot(FolderStore.full);
    // SET
    if (folder) {
      this.uiTitle = folder.title;
      this.title = folder.title;
      this.htmlTitleService.setCustomOrDefault(this.title, 'titles.folder');
    }
  }

  setTitle(): void {
    this.initTitle();

    // UPDATE WS
    this.store
      .select(FolderStore.fullFolderTitle)
      .pipe(takeUntil(this.ffnService.destroy), debounceTime(200))
      .subscribe((title) => this.updateTitle(title));

    // UPDATE CURRENT
    this.titleChange$
      .pipe(takeUntil(this.ffnService.destroy), debounceTime(updateTitleEntitesDelay))
      .subscribe((title) => {
        const command = new UpdateFolderTitle(title, this.folderId).updateFullFolder();
        this.store.dispatch(command);
        this.title = title;
        this.htmlTitleService.setCustomOrDefault(title, 'titles.folder');
      });
  }

  updateTitle(title: string): void {
    if (this.title !== title && this.folderTitleEl?.nativeElement) {
      const el = this.folderTitleEl?.nativeElement;
      const startPos = this.apiBrowserFunctions.getInputSelection(el);

      this.uiTitle = title;
      this.title = title;
      this.htmlTitleService.setCustomOrDefault(title, 'titles.folder');

      requestAnimationFrame(() => this.apiBrowserFunctions.setCaretInput(el, startPos));
    }
  }

  ngOnInit() {
    this.store.dispatch(new LoadLabels());
    this.store.dispatch(new UpdateRoute(EntityType.FolderInner));

    this.routeSubscription = this.route.params
      .pipe(takeUntil(this.ffnService.destroy))
      .subscribe(async (params) => {
        // REINIT LAYOUT
        if (this.folderId) {
          this.webSocketsFolderUpdaterService.leaveFolder(this.folderId);
        }

        await this.resetToDefault();

        // lOAD FOLDER
        this.folderId = params.id;
        await this.store.dispatch(new LoadFullFolder(this.folderId)).toPromise();
        this.folderLoaded = true;
        this.loadSideBar();
        this.setTitle();

        // INIT FOLDER NOTES
        const pr = this.store.selectSnapshot(UserStore.getPersonalizationSettings);
        const notes = await this.apiFullFolder.getFolderNotes(this.folderId, pr).toPromise();
        await this.ffnService.initializeEntities(notes, this.folderId);
        this.folderEntitiesLoaded = true;
        this.ffnService.updateState();

        const title = this.store.selectSnapshot(FolderStore.full)?.title;
        this.htmlTitleService.setCustomOrDefault(title, 'titles.folder');

        this.webSocketsFolderUpdaterService.tryJoinToFolder(this.folderId);
      });

    this.initManageButtonSubscribe();
    this.initHeaderButtonSubscribe();

    this.intervalSyncFolderState.pipe(takeUntil(this.ffnService.destroy))
      .subscribe(() => this.processSyncFolderState(this.folderId));
  }

  async processSyncFolderState(folderId: string) {
    const isCanViewFullFolder = this.store.selectSnapshot(FolderStore.isCanViewFullFolder);
    if (!isCanViewFullFolder) return;
    try {
      const folder = this.store.selectSnapshot(FolderStore.full);
      const noteIds = this.ffnService.entities.map((x) => x.id);
      const state = await this.apiFullFolder.syncFolderState(folderId, folder.version, noteIds).toPromise();
      if (state.success && state.data) {
        this.store.dispatch(new UpdateFullFolder({
          color: state.data.color,
          title: state.data.title,
          version: state.data.version
        }, folderId));
        if(state.data.noteIdsToDelete.length > 0) {
          this.ffnService.deleteFromDom([...state.data.noteIdsToDelete]);
        }
        if(state.data.noteIdsToAdd.length > 0){
          await this.ffnService.handleAdding(state.data.noteIdsToAdd);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  async resetToDefault() {
    await this.ffnService.murriService.muuriDestroyAsync();
    this.ffnService.setFirstInitedMurri(false);
    this.ffnService.resetState();
    this.folderLoaded = false;
    this.folderEntitiesLoaded = false;
    this.setSideBarNotesEmpty();
  }

  openChangeColorPopup() {
    const ids = [this.store.selectSnapshot(FolderStore.full).id];
    return this.dialogsService.openChangeColorDialog(EntityPopupType.Folder, ids);
  }

  initHeaderButtonSubscribe() {
    this.pService.newButtonSubject.pipe(takeUntil(this.ffnService.destroy)).subscribe((flag) => {
      if (flag) {
        this.store.dispatch(new CreateNote(false));
      }
    });

    this.actions$
      .pipe(ofActionDispatched(CreateNoteCompleted), takeUntil(this.ffnService.destroy))
      .subscribe(async (payload: CreateNoteCompleted) => {
        if (!this.isCanEdit) return;
        const note = payload.note;
        const resp = await this.apiFullFolder
          .addNotesToFolder([note.id], this.folderId, this.signalR.connectionIdOrError)
          .toPromise();
        if (resp.success) {
          this.ffnService.addToDom([note]);
          this.ffnService.updateState();
        }
      });

    this.pService.selectAllButton
      .pipe(takeUntil(this.ffnService.destroy))
      .subscribe(async (flag) => {
        if (flag) {
          const notes = this.ffnService.entities.filter((x) => !x.isSelected);
          // eslint-disable-next-line no-param-reassign
          notes.forEach((x) => (x.isSelected = true));
          const noteIds = notes.map((x) => x.id);
          this.store.dispatch(new SelectIdsNote(noteIds));
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
            await this.apiFullFolder.addNotesToFolder(ids, this.folderId, this.signalR.connectionIdOrError).toPromise();
            await this.ffnService.handleAdding(ids);
            this.ffnService.updateState();
          }
        });
    });

    this.pService.removeNotesToFolderSubject
      .pipe(takeUntil(this.ffnService.destroy))
      .subscribe(async () => {
        const ids = this.store.selectSnapshot(NoteStore.selectedIds);
        const res = await this.apiFullFolder.removeNotesFromFolder([...ids], this.folderId, this.signalR.connectionIdOrError).toPromise();
        if (res.success) {
          this.ffnService.deleteFromDom([...ids]);
          this.ffnService.updateState();
        }
        this.store.dispatch(UnSelectAllNote);
      });
  }

  getFolderMenu(folder: FullFolder) {
    if (!folder) return [];
    return this.menuButtonService.getFolderMenuByFolderType(folder.folderTypeId);
  }

  ngAfterViewInit(): void {
    this.ffnService.murriInitialize(this.refElements);
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

  async loadSideBar() {
    const pr = this.store.selectSnapshot(UserStore.getPersonalizationSettings);
    const types = Object.values(FolderTypeENUM).filter((q) => typeof q === 'number');
    const actions = types.map((action: FolderTypeENUM) => new LoadFolders(action, pr));
    await this.store.dispatch(actions).toPromise();
    const folder = this.store.selectSnapshot(FolderStore.full);
    if (folder) {
      this.setSideBarNotes(folder.folderTypeId);
    }
  }

  setSideBarNotesEmpty(): void {
    this.foldersLink = [];
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
    this.foldersLink = folders.filter((q) => q.id !== this.folderId);
  }
}
