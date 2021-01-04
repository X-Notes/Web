import { Component, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { PersonalizationService, showMenuLeftRight } from 'src/app/shared/services/personalization.service';
import { Theme } from 'src/app/shared/enums/Theme';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { Select, Store } from '@ngxs/store';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { NoteStore } from '../../notes/state/notes-state';
import { FolderStore } from '../../folders/state/folders-state';
import { MenuButtonsService } from '../menu-buttons.service';
import { EntityType } from 'src/app/shared/enums/EntityTypes';
import { NoteType } from 'src/app/shared/enums/NoteTypes';
import { FullNote } from '../../notes/models/fullNote';
import { ShortUser } from 'src/app/core/models/short-user';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations: [showMenuLeftRight]
})
export class HeaderComponent implements OnInit, OnDestroy {

  destroy = new Subject<void>();

  newButtonActive = false;
  // Upper Menu

  @Select(FolderStore.activeMenu)
  public menuActiveFolders$: Observable<boolean>;

  @Select(NoteStore.activeMenu)
  public menuActiveNotes$: Observable<boolean>;

  @Select(AppStore.getNewButtonActive)
  public newButtonActive$: Observable<boolean>;


  @Select(AppStore.isNoteInner)
  public isNoteInner$: Observable<boolean>;

  @Select(UserStore.getUser)
  public user$: Observable<ShortUser>;

  @Select(UserStore.getUserTheme)
  public theme$: Observable<Theme>;

  theme = Theme;
  router: string;

  constructor(public pService: PersonalizationService,
              private store: Store,
              public menuButtonService: MenuButtonsService) { }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  ngOnInit(): void {
    this.store.select(AppStore.getNewButtonActive)
      .pipe(takeUntil(this.destroy))
      .subscribe(z => {
        this.newButtonActive = z;
      });

    this.store.select(AppStore.getRouting)
      .pipe(takeUntil(this.destroy))
      .subscribe(async (x) => await this.routeChange(x));
    this.store.select(NoteStore.oneFull)
    .pipe(takeUntil(this.destroy))
    .subscribe(async (note) => await this.routeChangeFullNote(note));
  }

  showUsers() {
    this.pService.users = !this.pService.users;
  }

  hideMenu() {
    this.pService.hideInnerMenu = !this.pService.hideInnerMenu;
  }

  toggleSidebar() {
    this.pService.stateSidebar = !this.pService.stateSidebar;
  }

  async routeChangeFullNote(note: FullNote) {
    if (!note) {
      return;
    }
    switch (note.noteType) {
      case NoteType.Private: {
        this.menuButtonService.setItems(this.menuButtonService.notesItemsPrivate);
        break;
      }
      case NoteType.Shared: {
        this.menuButtonService.setItems(this.menuButtonService.notesItemsShared);
        break;
      }
      case NoteType.Deleted: {
        this.menuButtonService.setItems(this.menuButtonService.notesItemsDeleted);
        break;
      }
      case NoteType.Archive: {
        this.menuButtonService.setItems(this.menuButtonService.notesItemsArchive);
        break;
      }
    }
    this.router = 'note-inner';
  }

  async routeChange(type: EntityType) {

    switch (type) {
      case EntityType.FolderPrivate: {
        this.menuButtonService.setItems(this.menuButtonService.foldersItemsPrivate);
        this.router = 'items';
        break;
      }
      case EntityType.FolderShared: {
        this.menuButtonService.setItems(this.menuButtonService.foldersItemsShared);
        this.router = 'items';
        break;
      }
      case EntityType.FolderArchive: {
        this.menuButtonService.setItems(this.menuButtonService.foldersItemsArchive);
        this.router = 'items';
        break;
      }
      case EntityType.FolderDeleted: {
        this.menuButtonService.setItems(this.menuButtonService.foldersItemsDeleted);
        this.router = 'items';
        break;
      }
      case EntityType.NotePrivate: {
        this.menuButtonService.setItems(this.menuButtonService.notesItemsPrivate);
        this.router = 'items';
        break;
      }
      case EntityType.NoteShared: {
        this.menuButtonService.setItems(this.menuButtonService.notesItemsShared);
        this.router = 'items';
        break;
      }
      case EntityType.NoteArchive: {
        this.menuButtonService.setItems(this.menuButtonService.notesItemsArchive);
        this.router = 'items';
        break;
      }
      case EntityType.NoteDeleted: {
        this.menuButtonService.setItems(this.menuButtonService.notesItemsDeleted);
        this.router = 'items';
        break;
      }
      case EntityType.NoteInner: {
        this.router = 'note-inner';
        break;
      }

      case EntityType.LabelPrivate: {
        this.router = 'label';
        break;
      }
      case EntityType.LabelDeleted: {
        this.router = 'label-delete';
        break;
      }


      case EntityType.Profile: {
        this.router = 'profile';
        break;
      }

      default: {
        console.log('default');
      }
    }
  }
}
