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
import { NoteTypeENUM } from 'src/app/shared/enums/note-types.enum';
import { ShortUser } from 'src/app/core/models/short-user.model';
import { ConnectionPositionPair } from '@angular/cdk/overlay';
import { LoadNotifications } from 'src/app/core/stateApp/app-action';
import { SignalRService } from 'src/app/core/signal-r.service';
import { FolderTypeENUM } from 'src/app/shared/enums/folder-types.enum';
import { NoteStore } from '../../notes/state/notes-state';
import { MenuButtonsService } from '../menu-buttons.service';
import { FullNote } from '../../notes/models/full-note.model';
import { FolderStore } from '../../folders/state/folders-state';
import { FullFolder } from '../../folders/models/full-folder.model';
import { LabelStore } from '../../labels/state/labels-state';
import { AuthService } from 'src/app/core/auth.service';
import { UpdateUserInfo } from 'src/app/core/stateUser/user-action';

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

  @Select(AppStore.getNewButtonActive)
  public newButtonActive$: Observable<boolean>;

  @Select(AppStore.isNoteInner)
  public isNoteInner$: Observable<boolean>;

  @Select(UserStore.getUser)
  public user$: Observable<ShortUser>;

  @Select(LabelStore.countDeleted)
  countDeleted$: Observable<number>;

  destroy = new Subject<void>();

  newButtonActive = false;

  isOpenNotification = false;

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
  ) {}

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  ngOnInit(): void {
    this.store
      .select(AppStore.getNewButtonActive)
      .pipe(takeUntil(this.destroy))
      .subscribe((z) => {
        this.newButtonActive = z;
      });

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

    this.store.dispatch(LoadNotifications);
    this.signalRService.init(); // TODO NEED MOVE THIS AND ANOTHER LOGIC THAT MUST TRIGGER ON BEGGING APP LOADING TO 1 service.
  }


  showUsers() {
    this.pService.users = !this.pService.users;
  }

  closeNotification() {
    this.isOpenNotification = false;
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
    switch (folder.folderTypeId) {
      case FolderTypeENUM.Private: {
        this.menuButtonService.setItems(this.menuButtonService.notesItemsPrivate);
        break;
      }
      case FolderTypeENUM.Shared: {
        this.menuButtonService.setItems(this.menuButtonService.notesItemsShared);
        break;
      }
      case FolderTypeENUM.Deleted: {
        this.menuButtonService.setItems(this.menuButtonService.notesItemsDeleted);
        break;
      }
      case FolderTypeENUM.Archive: {
        this.menuButtonService.setItems(this.menuButtonService.notesItemsArchive);
        break;
      }
      default: {
        throw new Error('error');
      }
    }
  }

  routeChangeFullNote(note: FullNote) {
    // TODO REFACTOR
    if (!note) {
      return;
    }
    switch (note.noteTypeId) {
      case NoteTypeENUM.Private: {
        this.menuButtonService.setItems(this.menuButtonService.notesItemsPrivate);
        break;
      }
      case NoteTypeENUM.Shared: {
        this.menuButtonService.setItems(this.menuButtonService.notesItemsShared);
        break;
      }
      case NoteTypeENUM.Deleted: {
        this.menuButtonService.setItems(this.menuButtonService.notesItemsDeleted);
        break;
      }
      case NoteTypeENUM.Archive: {
        this.menuButtonService.setItems(this.menuButtonService.notesItemsArchive);
        break;
      }
      default: {
        throw new Error('error');
      }
    }
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
        this.menuButtonService.setItems(this.menuButtonService.foldersItemsPrivate);
        break;
      }
      case EntityType.FolderShared: {
        this.menuButtonService.setItems(this.menuButtonService.foldersItemsShared);
        break;
      }
      case EntityType.FolderArchive: {
        this.menuButtonService.setItems(this.menuButtonService.foldersItemsArchive);
        break;
      }
      case EntityType.FolderDeleted: {
        this.menuButtonService.setItems(this.menuButtonService.foldersItemsDeleted);
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
        this.menuButtonService.setItems(this.menuButtonService.notesItemsPrivate);
        break;
      }
      case EntityType.NoteShared: {
        this.menuButtonService.setItems(this.menuButtonService.notesItemsShared);
        break;
      }
      case EntityType.NoteArchive: {
        this.menuButtonService.setItems(this.menuButtonService.notesItemsArchive);
        break;
      }
      case EntityType.NoteDeleted: {
        this.menuButtonService.setItems(this.menuButtonService.notesItemsDeleted);
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
