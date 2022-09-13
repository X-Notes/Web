import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  AfterViewInit,
  QueryList,
  ViewChildren,
  Input,
} from '@angular/core';
import { MatMenu } from '@angular/material/menu';
import { ActivatedRoute } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable, Subject, Subscription } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { updateTitleEntitesDelay } from '../../../core/defaults/bounceDelay';
import { UpdaterEntitiesService } from '../../../core/entities-updater.service';
import { HtmlTitleService } from '../../../core/html-title.service';
import { ShortUser } from '../../../core/models/short-user.model';
import { SignalRService } from '../../../core/signal-r.service';
import { UpdateRoute } from '../../../core/stateApp/app-action';
import { UserStore } from '../../../core/stateUser/user-state';
import { EntityType } from '../../../shared/enums/entity-types.enum';
import { FolderTypeENUM } from '../../../shared/enums/folder-types.enum';
import { FontSizeENUM } from '../../../shared/enums/font-size.enum';
import { ThemeENUM } from '../../../shared/enums/theme.enum';
import { EntityPopupType } from '../../../shared/models/entity-popup-type.enum';
import { PersonalizationService } from '../../../shared/services/personalization.service';
import { DialogsManageService } from '../../navigation/services/dialogs-manage.service';
import { MenuButtonsService } from '../../navigation/services/menu-buttons.service';
import { ApiBrowserTextService } from '../../notes/api-browser-text.service';
import { DiffCheckerService } from '../../notes/full-note/content-editor/diffs/diff-checker.service';
import { SetFolderNotes, UnSelectAllNote } from '../../notes/state/notes-actions';
import { ApiFullFolderService } from '../full-folder/services/api-full-folder.service';
import { FullFolderNotesService } from '../full-folder/services/full-folder-notes.service';
import { WebSocketsFolderUpdaterService } from '../full-folder/services/web-sockets-folder-updater.service';
import { SmallFolder } from '../models/folder.model';
import { FullFolder } from '../models/full-folder.model';
import { LoadFolders, LoadFullFolder, UpdateFolderTitle } from '../state/folders-actions';
import { FolderStore } from '../state/folders-state';
import { OnDestroy } from '@angular/core';

@Component({
  selector: 'app-full-folder-content',
  templateUrl: './full-folder-content.component.html',
  styleUrls: ['./full-folder-content.component.scss'],
})
export class FullFolderContentComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatMenu) menu: MatMenu;

  @ViewChild('folderTitle', { read: ElementRef }) folderTitleEl: ElementRef<HTMLInputElement>;

  @ViewChildren('item', { read: ElementRef }) refElements: QueryList<ElementRef>;

  @Input()
  isReadOnlyMode = true;

  @Select(FolderStore.full)
  public folder$: Observable<FullFolder>;

  @Select(UserStore.getUserBackground)
  public userBackground$: Observable<string>;

  @Select(UserStore.getUser)
  public user$: Observable<ShortUser>;

  fontSize = FontSizeENUM;

  loaded = false;

  foldersLink: SmallFolder[] = [];

  // TITLE
  title: string;

  uiTitle: string;

  titleChange$: Subject<string> = new Subject<string>();

  private routeSubscription: Subscription;

  private folderId: string;

  constructor(
    public readonly pService: PersonalizationService,
    public readonly menuButtonService: MenuButtonsService,
    public readonly ffnService: FullFolderNotesService,
    public readonly dialogsService: DialogsManageService,
    private readonly store: Store,
    private readonly route: ActivatedRoute,
    private readonly htmlTitleService: HtmlTitleService,
    private readonly diffCheckerService: DiffCheckerService,
    private readonly apiBrowserFunctions: ApiBrowserTextService,
    private readonly webSocketsFolderUpdaterService: WebSocketsFolderUpdaterService,
    private readonly apiFullFolder: ApiFullFolderService,
    private readonly signalR: SignalRService,
    private readonly updateNoteService: UpdaterEntitiesService,
  ) {}

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
      .pipe(takeUntil(this.ffnService.destroy))
      .subscribe((title) => this.updateTitle(title));

    // UPDATE CURRENT
    this.titleChange$
      .pipe(takeUntil(this.ffnService.destroy), debounceTime(updateTitleEntitesDelay))
      .subscribe((title) => {
        const diffs = this.diffCheckerService.getDiffs(this.title, title);
        this.store.dispatch(new UpdateFolderTitle(diffs, title, this.folderId, true, null, false));
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
    const folder = this.store.selectSnapshot(FolderStore.full);
    if (folder) {
      await this.setSideBarNotes(folder.folderTypeId);
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

  async ngOnInit() {
    this.pService.setSpinnerState(true);
    this.store.dispatch(new UpdateRoute(EntityType.FolderInner));

    this.routeSubscription = this.route.params.subscribe(async (params) => {
      // REINIT LAYOUT
      let isReinit = false;
      if (this.folderId) {
        await this.ffnService.murriService.destroyGridAsync();
        isReinit = true;
        this.webSocketsFolderUpdaterService.leaveFolder(this.folderId);
      }
      // lOAD FOLDER
      this.folderId = params.id;
      await this.store.dispatch(new LoadFullFolder(this.folderId)).toPromise();
      this.setTitle();

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

  ngAfterViewInit(): void {
    this.ffnService.murriInitialise(this.refElements);
    this.initPanelClassStyleSubscribe();
  }

  ngOnDestroy(): void {
    this.store.dispatch(UnSelectAllNote);
    this.ffnService.onDestroy();
    this.webSocketsFolderUpdaterService.leaveFolder(this.folderId);
    this.updateNoteService.addFolderToUpdate(this.folderId);
    this.routeSubscription.unsubscribe();
  }

  openChangeColorPopup() {
    const ids = [this.store.selectSnapshot(FolderStore.full).id];
    return this.dialogsService.openChangeColorDialog(EntityPopupType.Folder, ids);
  }

  getFolderMenu(folder: FullFolder) {
    if (!folder) return [];
    return this.menuButtonService.getFolderMenuByFolderType(folder.folderTypeId);
  }
}
