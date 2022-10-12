import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  PersonalizationService,
  showMenuLeftRight,
  notification,
} from 'src/app/shared/services/personalization.service';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { Select, Store } from '@ngxs/store';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { EntityType } from 'src/app/shared/enums/entity-types.enum';
import { ShortUser } from 'src/app/core/models/user/short-user.model';
import { ConnectionPositionPair } from '@angular/cdk/overlay';
import { LoadNotifications } from 'src/app/core/stateApp/app-action';
import { SignalRService } from 'src/app/core/signal-r.service';
import { NoteStore } from '../../notes/state/notes-state';
import { FullNote } from '../../notes/models/full-note.model';
import { FolderStore } from '../../folders/state/folders-state';
import { FullFolder } from '../../folders/models/full-folder.model';
import { LabelStore } from '../../labels/state/labels-state';
import { MenuButtonsService } from '../services/menu-buttons.service';
import { PermissionsButtonsService } from '../services/permissions-buttons.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations: [showMenuLeftRight, notification],
})
export class HeaderComponent implements OnInit, OnDestroy {
  // Upper Menu

  @Select(AppStore.getNotificationsCount)
  public notificationCount$: Observable<number>;

  @Select(AppStore.getName)
  public route$: Observable<string>;

  @Select(AppStore.isProfile)
  public isProfile$: Observable<boolean>;

  @Select(AppStore.getMenuSwitch)
  public menuSwitch$: Observable<string>;

  @Select(AppStore.isNoteInner)
  public isNoteInner$: Observable<boolean>;

  @Select(AppStore.isFolderInner)
  public isFolderInner$: Observable<boolean>;

  @Select(UserStore.getUser)
  public user$: Observable<ShortUser>;

  @Select(LabelStore.countDeleted)
  countDeleted$: Observable<number>;

  destroy = new Subject<void>();

  isOpenNotification = false;

  public photoError = false;

  public positions = [
    new ConnectionPositionPair(
      {
        originX: 'start',
        originY: 'top',
      },
      { overlayX: 'start', overlayY: 'top' },
      0,
      1,
    ),
  ];

  constructor(
    public pService: PersonalizationService,
    private store: Store,
    public menuButtonService: MenuButtonsService,
    private signalRService: SignalRService,
    public pB: PermissionsButtonsService,
  ) {}

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  async ngOnInit(): Promise<void> {
    this.store
      .select(AppStore.getRouting)
      .pipe(takeUntil(this.destroy))
      .subscribe(async (x) => this.routeChange(x));
    this.store
      .select(NoteStore.oneFull)
      .pipe(takeUntil(this.destroy))
      .subscribe(async (note) => this.routeChangeFullNote(note));

    this.store
      .select(FolderStore.full)
      .pipe(takeUntil(this.destroy))
      .subscribe(async (folder) => this.routeChangeFullFolder(folder));

    this.store
      .select(UserStore.getUser)
      .pipe(takeUntil(this.destroy))
      .subscribe(() => {
        this.photoError = false;
      });

    this.store.dispatch(LoadNotifications);
    await this.signalRService.init(); // TODO NEED MOVE THIS AND ANOTHER LOGIC THAT MUST TRIGGER ON BEGGING APP LOADING TO 1 service.
  }

  showUsers() {
    this.pService.users = !this.pService.users;
  }

  closeNotification() {
    this.isOpenNotification = false;
  }

  changeSource() {
    this.photoError = true;
  }

  hideMenu() {
    this.pService.hideInnerMenu = !this.pService.hideInnerMenu;
  }

  toggleSidebar() {
    this.pService.stateSidebar = !this.pService.stateSidebar;
  }

  routeChangeFullFolder(folder: FullFolder) {
    // TODO REFACTOR
    if (!folder) {
      return;
    }

    this.menuButtonService.setFoldersItems(this.menuButtonService.folderInnerNotesItems);
  }

  routeChangeFullNote(note: FullNote) {
    // TODO REFACTOR
    if (!note) {
      return;
    }
    const items = this.menuButtonService.getNoteMenuByNoteType(note.noteTypeId);
    this.menuButtonService.setNotesItems(items);
  }

  newButton() {
    this.pService.newButtonSubject.next(true);
  }

  deleteAllFromBin() {
    this.pService.emptyTrashButtonSubject.next(true);
  }

  routeChange(type: EntityType) {
    // TODO REFACTOR
    if (!type) {
      return;
    }
    switch (type) {
      // FOLDER
      case EntityType.FolderPrivate: {
        this.menuButtonService.setFoldersItems(this.menuButtonService.foldersItemsPrivate);
        break;
      }
      case EntityType.FolderShared: {
        this.menuButtonService.setFoldersItems(this.menuButtonService.foldersItemsShared);
        break;
      }
      case EntityType.FolderArchive: {
        this.menuButtonService.setFoldersItems(this.menuButtonService.foldersItemsArchive);
        break;
      }
      case EntityType.FolderDeleted: {
        this.menuButtonService.setFoldersItems(this.menuButtonService.foldersItemsDeleted);
        break;
      }
      case EntityType.FolderInner: {
        break;
      }
      case EntityType.FolderInnerNote: {
        break;
      }

      // NOTES
      case EntityType.NotePrivate: {
        this.menuButtonService.setNotesItems(this.menuButtonService.notesItemsPrivate);
        break;
      }
      case EntityType.NoteShared: {
        this.menuButtonService.setNotesItems(this.menuButtonService.notesItemsShared);
        break;
      }
      case EntityType.NoteArchive: {
        this.menuButtonService.setNotesItems(this.menuButtonService.notesItemsArchive);
        break;
      }
      case EntityType.NoteDeleted: {
        this.menuButtonService.setNotesItems(this.menuButtonService.notesItemsDeleted);
        break;
      }
      case EntityType.NoteInner: {
        break;
      }

      // LABELS
      case EntityType.LabelPrivate: {
        break;
      }
      case EntityType.LabelDeleted: {
        break;
      }

      // PROFILE
      case EntityType.Profile: {
        break;
      }

      case EntityType.History: {
        break;
      }

      default: {
        throw new Error('error');
      }
    }
  }
}
