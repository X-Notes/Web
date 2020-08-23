import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { PersonalizationService,
         showMenuLeftRight } from 'src/app/shared/services/personalization.service';
import { Theme } from 'src/app/shared/enums/Theme';
import { Router, NavigationEnd } from '@angular/router';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { ShortUser } from 'src/app/core/models/short-user';
import { Select, Store } from '@ngxs/store';
import { UnSelectAllNote, SelectAllNote, ChangeColorNote, SetDeleteNotes,
  DeleteNotesPermanently, RestoreNotes, ArchiveNotes, MakePublicNotes, MakePrivateNotes, CopyNotes } from '../../notes/state/notes-actions';
import { RoutePathes } from 'src/app/shared/enums/RoutePathes';
import { NoteType } from 'src/app/shared/enums/NoteTypes';
import { NoteColorPallete } from 'src/app/shared/enums/NoteColors';
import { FolderType } from 'src/app/shared/enums/FolderTypes';
import { SelectAllFolder, UnSelectAllFolder, ArchiveFolders, ChangeColorFolder,
  SetDeleteFolders, RestoreFolders, DeleteFoldersPermanently, CopyFolders,
   MakePublicFolders, MakePrivateFolders } from '../../folders/state/folders-actions';
import { DialogService } from 'src/app/shared/modal_components/dialog.service';
import { ChangeColorComponent } from 'src/app/shared/modal_components/change-color/change-color.component';
import { MatDialogConfig } from '@angular/material/dialog';
import { ChangeTheme } from 'src/app/core/stateUser/user-action';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { NoteStore } from '../../notes/state/notes-state';
import { FolderStore } from '../../folders/state/folders-state';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations: [ showMenuLeftRight ]
})
export class HeaderComponent implements OnInit, OnDestroy {

  destroy = new Subject<void>();

  @Select(AppStore.isNoteInner)
  public isNoteInner$: Observable<boolean>;

  @Select(AppStore.getRoutePath)
  public route$: Observable<RoutePathes>;

  @Select(UserStore.getUser)
  public user$: Observable<ShortUser>;

  @Select(UserStore.getUserTheme)
  public theme$: Observable<Theme>;

  theme = Theme;

  selectAllActive = true;
  settingsActive = true;
  selected = false;

  user: number[] = [1, 2, 3, 4, 5, 6, 7, 8, ];

  constructor(public pService: PersonalizationService,
              private router: Router,
              private store: Store,
              private dialogService: DialogService) { }

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

    this.checkRout();
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

  configShowMenu(flag: boolean) {
    if (flag) {
      this.selected = true;
      this.pService.newButtonActive = false;
    } else {
      this.selected = false;
      this.pService.newButtonActive = true;
    }
  }

  toggleOrientation() {
    this.pService.orientationMobile = !this.pService.orientationMobile;
    setTimeout( () => this.pService.grid.refreshItems().layout(), 0);
  }

  checkRout() {
    this.routeChange(this.router.url);
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd))
      .subscribe(event => { this.routeChange((event as NavigationEnd).url); });
  }

  routeChange(url: string) {
    switch (url) {

      case '/folders' : {
        this.showAllButtons();
        break;
      }
      case '/folders/shared' : {
        this.showAllButtons();
        break;
      }
      case '/folders/deleted' : {
        this.showAllButtons();
        break;
      }
      case '/folders/archive' : {
        this.showAllButtons();
        break;
      }


      case '/notes' : {
        this.showAllButtons();
        break;
      }
      case '/notes/shared' : {
        this.showAllButtons();
        break;
      }
      case '/notes/deleted' : {
        this.showAllButtons();
        break;
      }
      case '/notes/archive' : {
        this.showAllButtons();
        break;
      }

      case '/labels' : {
        this.selectAllActive = false;
        this.showAllButtons();
        this.settingsActive = false;
        this.selectAllActive = false;
        break;
      }
      case '/labels/deleted' : {
        this.settingsActive = false;
        this.selectAllActive = false;
        this.pService.newButtonActive = false;
        break;
      }
      default : {
        this.pService.newButtonActive = false;
        break;
      }

    }
  }

  showAllButtons() {
    this.pService.newButtonActive = true;
    this.selectAllActive = true;
    this.settingsActive = true;
  }

  newButton() {
    this.pService.subject.next(true);
  }

  // Selection

  selectAll() {
    const routePath = this.store.selectSnapshot(AppStore.getRoutePath);
    switch (routePath) {
      case RoutePathes.Folder: {
        const folderType = this.store.selectSnapshot(AppStore.getFolderType);
        this.store.dispatch(new SelectAllFolder(folderType));
        break;
      }
      case RoutePathes.Note: {
        const noteType = this.store.selectSnapshot(AppStore.getNoteType);
        this.store.dispatch(new SelectAllNote(noteType));
        break;
      }
    }
  }

  unselectAll() {
    const routePath = this.store.selectSnapshot(AppStore.getRoutePath);
    switch (routePath) {
      case RoutePathes.Folder: {
        this.store.dispatch(new UnSelectAllFolder());
        break;
      }
      case RoutePathes.Note: {
        this.store.dispatch(new UnSelectAllNote());
        break;
      }
    }
  }

  // UPPER MENU FUNCTION NOTES
  changeColor() {
    const noteType = this.store.selectSnapshot(AppStore.getNoteType);
    this.store.dispatch(new ChangeColorNote(NoteColorPallete.BlueOne, noteType));
  }

  setdeleteNotes() {
    const noteType = this.store.selectSnapshot(AppStore.getNoteType);
    this.store.dispatch(new SetDeleteNotes(noteType));
  }

  deleteNotes() {
    this.store.dispatch(new DeleteNotesPermanently());
  }

  restoreNotes() {
    this.store.dispatch(new RestoreNotes());
  }

  archiveNotes() {
    const noteType = this.store.selectSnapshot(AppStore.getNoteType);
    this.store.dispatch(new ArchiveNotes(noteType));
  }

  makePublic() {
    const noteType = this.store.selectSnapshot(AppStore.getNoteType);
    this.store.dispatch(new MakePublicNotes(noteType));
  }

  makePrivate() {
    const noteType = this.store.selectSnapshot(AppStore.getNoteType);
    this.store.dispatch(new MakePrivateNotes(noteType));
  }

  copyNotes() {
    const noteType = this.store.selectSnapshot(AppStore.getNoteType);
    this.store.dispatch(new CopyNotes(noteType));
  }

  // UPPER MENU FUNCTIONS FOLDERS

  archiveFolders() {
    const folderType = this.store.selectSnapshot(AppStore.getFolderType);
    this.store.dispatch(new ArchiveFolders(folderType));
  }

  changeColorFolder() {
    const folderType = this.store.selectSnapshot(AppStore.getFolderType);
    this.store.dispatch(new ChangeColorFolder(NoteColorPallete.BlueOne, folderType));
  }

  setDeleteFolders() {
    const folderType = this.store.selectSnapshot(AppStore.getFolderType);
    this.store.dispatch(new SetDeleteFolders(folderType));
  }

  restoreFolders() {
    const folderType = this.store.selectSnapshot(AppStore.getFolderType);
    this.store.dispatch(new RestoreFolders());
  }

  deleteFolders() {
    this.store.dispatch(new DeleteFoldersPermanently());
  }

  copyFolders() {
    const folderType = this.store.selectSnapshot(AppStore.getFolderType);
    this.store.dispatch(new CopyFolders(folderType));
  }

  makePublicFolder() {
    const folderType = this.store.selectSnapshot(AppStore.getFolderType);
    this.store.dispatch(new MakePublicFolders(folderType));
  }

  makePrivateFolder() {
    const folderType = this.store.selectSnapshot(AppStore.getFolderType);
    this.store.dispatch(new MakePrivateFolders(folderType));
  }

  // Modal Windows

  changeColorNote() {
    const theme = this.store.selectSnapshot(UserStore.getUserTheme);
    const config: MatDialogConfig =  {
      width: '450px',
      minHeight: '380px',
      data: {
        title: 'Colors'
      },
      panelClass: theme === Theme.Light ? 'custom-dialog-class-light' : 'custom-dialog-class-dark'
    };
    this.dialogService.openDialog(ChangeColorComponent, config);
  }
}
