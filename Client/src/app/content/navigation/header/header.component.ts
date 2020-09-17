import { Component, OnInit, OnDestroy } from '@angular/core';
import { PersonalizationService,
         showMenuLeftRight } from 'src/app/shared/services/personalization.service';
import { Theme } from 'src/app/shared/enums/Theme';
import {  Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { ShortUser } from 'src/app/core/models/short-user';
import { Select, Store } from '@ngxs/store';
import { UnSelectAllNote, SelectAllNote,
  DeleteNotesPermanently,  ArchiveNotes, MakePublicNotes, MakePrivateNotes } from '../../notes/state/notes-actions';
import { SelectAllFolder, UnSelectAllFolder, ArchiveFolders, DeleteFoldersPermanently,
  MakePublicFolders, MakePrivateFolders } from '../../folders/state/folders-actions';
import { ChangeTheme, SetDefaultBackground } from 'src/app/core/stateUser/user-action';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { NoteStore } from '../../notes/state/notes-state';
import { FolderStore } from '../../folders/state/folders-state';
import { UpdateNewButton,  UpdateMenuActive, UpdateSettingsButton,
  UpdateSelectAllButton, UpdateDefaultBackgroundButton } from 'src/app/core/stateApp/app-action';
import { MenuButtonsService } from '../menu-buttons.service';
import { EntityType } from 'src/app/shared/enums/EntityTypes';
import { NoteType } from 'src/app/shared/enums/NoteTypes';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations: [ showMenuLeftRight ]
})
export class HeaderComponent implements OnInit, OnDestroy {

  public countSelected: number;

  destroy = new Subject<void>();

  // Upper Menu

  @Select(AppStore.getNewButtonActive)
  public newButtonActive$: Observable<boolean>;

  @Select(AppStore.getSettingsButtonActive)
  public settingsButtonActive$: Observable<boolean>;

  @Select(AppStore.getSelectAllButtonActive)
  public selectAllButtonActive$: Observable<boolean>;

  @Select(AppStore.getMenuActive)
  public menuActive$: Observable<boolean>;

  @Select(AppStore.getdefaultBackground)
  public defaultBackground$: Observable<boolean>;
  //

  @Select(AppStore.isNoteInner)
  public isNoteInner$: Observable<boolean>;

  @Select(AppStore.getName)
  public route$: Observable<string>;

  @Select(UserStore.getUser)
  public user$: Observable<ShortUser>;

  @Select(UserStore.getUserTheme)
  public theme$: Observable<Theme>;

  theme = Theme;

  user: number[] = [1, 2, 3, 4, 5, 6, 7, 8, ];

  constructor(public pService: PersonalizationService,
              private store: Store,
              public menuButtonService: MenuButtonsService) { }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  ngOnInit(): void {

    this.store.select(NoteStore.activeMenu)
    .pipe(takeUntil(this.destroy))
    .subscribe(x => this.configShowMenu(x));

    this.store.select(FolderStore.activeMenu)
    .pipe(takeUntil(this.destroy))
    .subscribe(x => this.configShowMenu(x));

    this.store.select(AppStore.getRouting)
    .pipe(takeUntil(this.destroy))
    .subscribe(x => this.routeChange(x));

    this.store.select(NoteStore.selectedCount)
    .pipe(takeUntil(this.destroy))
    .subscribe(x => {
      if (x > 0) {
        this.countSelected = x;
      }
    });

    this.store.select(FolderStore.selectedCount)
    .pipe(takeUntil(this.destroy))
    .subscribe(x => {
      if (x > 0) {
        this.countSelected = x;
      }
    });
  }

  showUsers() {
    this.pService.users = !this.pService.users;
  }

  hideMenu() {
    this.pService.hideInnerMenu = !this.pService.hideInnerMenu;
  }

  toggleTheme() {
    this.store.dispatch(new ChangeTheme());
  }

  toggleSidebar() {
    this.pService.stateSidebar = !this.pService.stateSidebar;
  }

  closeMenu(): void {
    if(this.pService.checkWidth()) {
      this.pService.users = false;
    }

    if(!this.pService.check()) {
      this.pService.hideInnerMenu = false;
    }
  }

  configShowMenu(flag: boolean) {
    if (this.store.selectSnapshot(AppStore.isNoteInner)) {
      this.store.dispatch(new UpdateNewButton(false));
      return;
    }
    if (flag) {
      this.store.dispatch(new UpdateNewButton(false));
      this.store.dispatch(new UpdateMenuActive(true));
    } else {
     this.store.dispatch(new UpdateNewButton(true));
     this.store.dispatch(new UpdateMenuActive(false));
    }
  }

  toggleOrientation() {
    this.pService.orientationMobile = !this.pService.orientationMobile;
    setTimeout( () => this.pService.grid.refreshItems().layout(), 0);
  }



  async routeChange(type: EntityType) {

    switch (type) {
      case EntityType.FolderPrivate: {
        this.showAllButtons();
        this.store.dispatch(new UpdateDefaultBackgroundButton(false));
        this.menuButtonService.setFoldersPrivate();
        break;
      }
      case EntityType.FolderShared: {
        this.showAllButtons();
        this.store.dispatch(new UpdateDefaultBackgroundButton(false));
        this.menuButtonService.setFoldersShared();
        break;
      }
      case EntityType.FolderArchive: {
        this.showAllButtons();
        this.store.dispatch(new UpdateDefaultBackgroundButton(false));
        this.menuButtonService.setFoldersArchive();
        break;
      }
      case EntityType.FolderDeleted: {
        this.showAllButtons();
        this.store.dispatch(new UpdateDefaultBackgroundButton(false));
        this.menuButtonService.setFoldersDeleted();
        break;
      }
      case EntityType.FolderInner: {
        // this.menuButtonService.setInnerFolder();
        break;
      }

      case EntityType.NotePrivate: {
        this.showAllButtons();
        this.store.dispatch(new UpdateDefaultBackgroundButton(false));
        this.menuButtonService.setNotesPrivate();
        break;
      }
      case EntityType.NoteShared: {
        this.showAllButtons();
        this.store.dispatch(new UpdateDefaultBackgroundButton(false));
        this.menuButtonService.setNotesShared();
        break;
      }
      case EntityType.NoteArchive: {
        this.showAllButtons();
        this.store.dispatch(new UpdateDefaultBackgroundButton(false));
        this.menuButtonService.setNotesArchive();
        break;
      }
      case EntityType.NoteDeleted: {
        this.showAllButtons();
        this.store.dispatch(new UpdateDefaultBackgroundButton(false));
        this.menuButtonService.setNotesDeleted();
        break;
      }
      case EntityType.NoteInner:
      this.store.dispatch(new UpdateDefaultBackgroundButton(false)); {
       // await this.store.dispatch(new UpdateNewButton(false)).toPromise();
        switch (this.store.selectSnapshot(AppStore.getInnerNoteType)) {
          case NoteType.Private: {
            this.menuButtonService.setNotesPrivate();
            break;
          }
          case NoteType.Shared: {
            this.menuButtonService.setNotesShared();
            break;
          }
          case NoteType.Deleted: {
            this.menuButtonService.setNotesDeleted();
            break;
          }
          case NoteType.Archive: {
            this.menuButtonService.setNotesArchive();
            break;
          }
        }
        break;
      }

      case EntityType.LabelPrivate: {
        this.store.dispatch(new UpdateDefaultBackgroundButton(false));
        await this.store.dispatch(new UpdateSettingsButton(false)).toPromise();
        await this.store.dispatch(new UpdateNewButton(true)).toPromise();
        await this.store.dispatch(new UpdateSelectAllButton(false)).toPromise();
        break;
      }
      case EntityType.LabelDeleted: {
        this.store.dispatch(new UpdateDefaultBackgroundButton(false));
        await this.store.dispatch(new UpdateSettingsButton(false)).toPromise();
        await this.store.dispatch(new UpdateNewButton(false)).toPromise();
        await this.store.dispatch(new UpdateSelectAllButton(false)).toPromise();
        break;
      }


      case EntityType.Profile: {
        this.store.dispatch(new UpdateDefaultBackgroundButton(true));
        await this.store.dispatch(new UpdateSettingsButton(false)).toPromise();
        await this.store.dispatch(new UpdateNewButton(true)).toPromise();
        await this.store.dispatch(new UpdateSelectAllButton(false)).toPromise();
        break;
      }

      default: {
        console.log('default');
      }
    }
  }

  async showAllButtons() {
    await this.store.dispatch(new UpdateSettingsButton(true)).toPromise();
    await this.store.dispatch(new UpdateNewButton(true)).toPromise();
    await this.store.dispatch(new UpdateSelectAllButton(true)).toPromise();
  }

  newButton() {
    this.pService.subject.next(true);
  }

  // Selection

  selectAll() {
    let routePath = this.store.selectSnapshot(AppStore.isNote);
    if (routePath) {
      const noteType = this.store.selectSnapshot(AppStore.getRouting);
      this.store.dispatch(new SelectAllNote(noteType));
    }
    routePath = this.store.selectSnapshot(AppStore.isFolder);
    if (routePath) {
      const folderType = this.store.selectSnapshot(AppStore.getRouting);
      this.store.dispatch(new SelectAllFolder(folderType));
    }
  }

  unselectAll() {
    let routePath = this.store.selectSnapshot(AppStore.isNote);
    if (routePath) {
      this.store.dispatch(new UnSelectAllNote());
    }
    routePath = this.store.selectSnapshot(AppStore.isFolder);
    if (routePath) {
      this.store.dispatch(new UnSelectAllFolder());
    }
  }

  setDefaultColorProfile() {
    this.store.dispatch(new SetDefaultBackground());
  }

  // UPPER MENU FUNCTION NOTES




  makePublic() {
    const noteType = this.store.selectSnapshot(AppStore.getRouting);
    this.store.dispatch(new MakePublicNotes(noteType));
  }

  makePrivate() {
    const noteType = this.store.selectSnapshot(AppStore.getRouting);
    this.store.dispatch(new MakePrivateNotes(noteType));
  }


  // UPPER MENU FUNCTIONS FOLDERS


  makePublicFolder() {
    const folderType = this.store.selectSnapshot(AppStore.getRouting);
    this.store.dispatch(new MakePublicFolders(folderType));
  }

  makePrivateFolder() {
    const folderType = this.store.selectSnapshot(AppStore.getRouting);
    this.store.dispatch(new MakePrivateFolders(folderType));
  }

  // Modal Windows
  settingsClick() {
    console.log('settings');
  }
}
