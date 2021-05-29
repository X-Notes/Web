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
import { MatMenu } from '@angular/material/menu';
import { ThemeENUM } from 'src/app/shared/enums/ThemeEnum';
import { LoadFolders, LoadFullFolder } from '../state/folders-actions';
import { FolderStore } from '../state/folders-state';
import { FullFolder } from '../models/FullFolder';
import { SmallFolder } from '../models/folder';
import { FullFolderNotesService } from './services/full-folder-notes.service';
import { DialogsManageService } from '../../navigation/dialogs-manage.service';
import { ApiFullFolderService } from './services/api-full-folder.service';
import { MenuButtonsService } from '../../navigation/menu-buttons.service';
import { NotesService } from '../../notes/notes.service';
import { ApiServiceNotes } from '../../notes/api-notes.service';
import { LoadNotes, SelectIdNote } from '../../notes/state/notes-actions';

@Component({
  selector: 'app-full-folder',
  templateUrl: './full-folder.component.html',
  styleUrls: ['./full-folder.component.scss'],
  animations: [sideBarCloseOpen],
  providers: [FullFolderNotesService, NotesService],
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
  public userBackground$: Observable<ShortUser>;

  @Select(UserStore.getUser)
  public user$: Observable<ShortUser>;

  public photoError = false;

  fontSize = FontSizeENUM;

  destroy = new Subject<void>();

  foldersLink: SmallFolder[] = [];

  public folder: FullFolder;

  loaded = false;

  private routeSubscription: Subscription;

  private id: string;

  constructor(
    private store: Store,
    public murriService: MurriService,
    private route: ActivatedRoute,
    public pService: PersonalizationService,
    public ffnService: FullFolderNotesService,
    public dialogsService: DialogsManageService,
    private apiFullFolder: ApiFullFolderService,
    public menuButtonService: MenuButtonsService,
    public noteService: NotesService,
    public noteApiService: ApiServiceNotes,
  ) {}

  ngAfterViewInit(): void {
    this.ffnService.murriInitialise(this.refElements);
    this.initPanelClassStyleSubscribe();
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

            if (this.folder) {
              await this.ffnService.loadNotes(this.folder.id);
            }

            await this.pService.waitPreloading();
            this.pService.setSpinnerState(false);
            this.loaded = true;

            if (this.folder) {
              this.loadSideBar();
            }

            const types = this.store.selectSnapshot(AppStore.getNoteTypes);
            const actions = types.map((t) => new LoadNotes(t.id, t));
            this.store.dispatch(actions);
          }
        });
    });

    this.initManageButtonSubscribe();
    this.initHeaderButtonSubscribe();
  }

  get folderMenu() {
    const type = this.folder?.folderType;
    if (type) {
      return this.menuButtonService.getFolderMenuByFolderType(type);
    }
    return [];
  }

  initHeaderButtonSubscribe() {
    this.pService.newButtonSubject.pipe(takeUntil(this.destroy)).subscribe(async (flag) => {
      if (flag) {
        const newNote = await this.noteApiService.new().toPromise();
        const ids = [newNote.id, ...this.noteService.notes.map((z) => z.id)];
        await this.apiFullFolder.updateNotesInFolder(ids, this.folder.id).toPromise();
        this.noteService.addToDom([newNote]);
      }
    });

    this.pService.selectAllButton.pipe(takeUntil(this.destroy)).subscribe(async (flag) => {
      if (flag) {
        const notes = this.noteService.notes.filter(
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
    this.store
      .select(UserStore.getUserTheme)
      .pipe(takeUntil(this.destroy))
      .subscribe((theme) => {
        if (theme) {
          if (theme.name === ThemeENUM.Dark) {
            this.menu.panelClass = 'dark-menu';
          } else {
            this.menu.panelClass = null;
          }
        }
      });
  }

  initManageButtonSubscribe() {
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
    this.store
      .select(FolderStore.full)
      .pipe(takeUntil(this.destroy))
      .subscribe((folder) => (this.folder = folder));
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
