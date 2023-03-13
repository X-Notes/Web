/* eslint-disable no-return-assign */
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
import { EntityType } from 'src/app/shared/enums/entity-types.enum';
import { Observable, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { ShortUser } from 'src/app/core/models/user/short-user.model';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { FolderTypeENUM } from 'src/app/shared/enums/folder-types.enum';
import { EntitiesSizeENUM } from 'src/app/shared/enums/font-size.enum';
import { UpdaterEntitiesService } from 'src/app/core/entities-updater.service';
import { FolderStore } from '../state/folders-state';
import { FullFolder } from '../models/full-folder.model';
import { SmallFolder } from '../models/folder.model';
import { FullFolderNotesService } from './services/full-folder-notes.service';
import { DialogsManageService } from '../../navigation/services/dialogs-manage.service';
import { ApiFullFolderService } from './services/api-full-folder.service';
import { ApiServiceNotes } from '../../notes/api-notes.service';
import { SelectIdNote, SetFolderNotes, UnSelectAllNote } from '../../notes/state/notes-actions';
import { WebSocketsFolderUpdaterService } from './services/web-sockets-folder-updater.service';
import { NoteStore } from '../../notes/state/notes-state';
import { MenuButtonsService } from '../../navigation/services/menu-buttons.service';
import { LoadFullFolder, LoadFolders } from '../state/folders-actions';
import { PermissionsButtonsService } from '../../navigation/services/permissions-buttons.service';
import { SignalRService } from 'src/app/core/signal-r.service';
import { LoadLabels } from '../../labels/state/labels-actions';
import { SnackbarService } from 'src/app/shared/services/snackbar/snackbar.service';
import { TranslateService } from '@ngx-translate/core';
import { OperationResultAdditionalInfo } from 'src/app/shared/models/operation-result.model';
import { NoteComponent } from '../../notes/note/note.component';

@Component({
  selector: 'app-full-folder',
  templateUrl: './full-folder.component.html',
  styleUrls: ['./full-folder.component.scss'],
  providers: [FullFolderNotesService, WebSocketsFolderUpdaterService],
})
export class FullFolderComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChildren('item', { read: ElementRef }) refElements: QueryList<ElementRef>;

  @Select(FolderStore.canEdit)
  public canEdit$: Observable<boolean>;

  @Select(FolderStore.full)
  public folder$: Observable<FullFolder>;

  @Select(UserStore.getUserBackground)
  public userBackground$: Observable<string>;

  @Select(UserStore.getUser)
  public user$: Observable<ShortUser>;

  @ViewChildren(NoteComponent) set viewNoteChildren(elms: QueryList<NoteComponent>) {
    this.ffnService.viewElements = elms;
  }

  fontSize = EntitiesSizeENUM;

  foldersLink: SmallFolder[] = [];

  loaded = false;

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
    private webSocketsFolderUpdaterService: WebSocketsFolderUpdaterService,
    public pB: PermissionsButtonsService,
    private signalR: SignalRService,
    private snackbarService: SnackbarService,
    private translate: TranslateService,
  ) {}

  async ngOnInit() {
    this.store.dispatch(new LoadLabels());
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

      // INIT FOLDER NOTES
      const pr = this.store.selectSnapshot(UserStore.getPersonalizationSettings);
      const notes = await this.apiFullFolder.getFolderNotes(this.folderId, pr).toPromise();
      await this.ffnService.initializeEntities(notes, this.folderId);
      this.ffnService.updateState();

      if (isReinit) {
        await this.ffnService.murriService.initFolderNotesAsync();
        await this.ffnService.murriService.setOpacityFlagAsync(0);
      }

      // WS UPDATES
      this.signalR.updateFolder$.pipe(takeUntil(this.ffnService.destroy)).subscribe(async (x) => {
        await this.ffnService.handlerUpdates(x);
        this.ffnService.updateState();
      });

      await this.pService.waitPreloading();
      this.pService.setSpinnerState(false);
      this.loaded = true;

      this.loadSideBar();

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
          const res = await this.noteApiService.new().toPromise();
          if (res.success) {
            const newNote = res.data;
            await this.apiFullFolder.addNotesToFolder([newNote.id], this.folderId).toPromise();
            this.ffnService.addToDom([newNote]);
            this.ffnService.updateState();
            return;
          }
          if (!res.success && res.status === OperationResultAdditionalInfo.BillingError) {
            const message = this.translate.instant('snackBar.subscriptionCreationError');
            this.snackbarService.openSnackBar(message, null, null, 5000);
          }
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
            this.ffnService.updateState();
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
          this.ffnService.updateState();
        }
        this.store.dispatch(UnSelectAllNote);
      });
  }


  getTitle(folder: SmallFolder): string {
    return folder.title?.readStr();
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
    this.foldersLink = folders.filter((q) => q.id !== this.folderId);
  }
}
