import { Component, OnInit } from '@angular/core';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { Theme } from 'src/app/shared/enums/Theme';
import { Router, NavigationEnd } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
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
import { UpdateRoutePath, UpdateFolderType, UpdateNoteType } from 'src/app/core/stateApp/app-action';
import { AppStore } from 'src/app/core/stateApp/app-state';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {


  @Select(AppStore.getRoutePath)
  public route$: Observable<RoutePathes>;

  @Select(UserStore.getUser)
  public user$: Observable<ShortUser>;

  @Select(UserStore.getUserTheme)
  public theme$: Observable<Theme>;

  theme = Theme;

  newButtonActive = true;
  selectAllActive = true;
  settingsActive = true;

  constructor(public pService: PersonalizationService,
              private router: Router,
              private store: Store,
              private dialogService: DialogService) { }

  ngOnInit(): void {
    this.checkRout();
  }

  toggleTheme() {
    this.store.dispatch(new ChangeTheme());
  }

  toggleSidebar() {
    this.pService.stateSidebar = !this.pService.stateSidebar;
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
        this.store.dispatch(new UpdateRoutePath(RoutePathes.Folder));
        this.showAllButtons();
        this.store.dispatch(new UpdateFolderType(FolderType.Private));
        break;
      }
      case '/folders/shared' : {
        this.store.dispatch(new UpdateRoutePath(RoutePathes.Folder));
        this.showAllButtons();
        this.store.dispatch(new UpdateFolderType(FolderType.Shared));
        break;
      }
      case '/folders/deleted' : {
        this.store.dispatch(new UpdateRoutePath(RoutePathes.Folder));
        this.showAllButtons();
        this.store.dispatch(new UpdateFolderType(FolderType.Deleted));
        break;
      }
      case '/folders/archive' : {
        this.store.dispatch(new UpdateRoutePath(RoutePathes.Folder));
        this.showAllButtons();
        this.store.dispatch(new UpdateFolderType(FolderType.Archive));
        break;
      }


      case '/notes' : {
        this.store.dispatch(new UpdateRoutePath(RoutePathes.Note));
        this.showAllButtons();
        this.store.dispatch(new UpdateNoteType(NoteType.Private));
        break;
      }
      case '/notes/shared' : {
        this.store.dispatch(new UpdateRoutePath(RoutePathes.Note));
        this.showAllButtons();
        this.store.dispatch(new UpdateNoteType(NoteType.Shared));
        break;
      }
      case '/notes/deleted' : {
        this.store.dispatch(new UpdateRoutePath(RoutePathes.Note));
        this.showAllButtons();
        this.store.dispatch(new UpdateNoteType(NoteType.Deleted));
        break;
      }
      case '/notes/archive' : {
        this.store.dispatch(new UpdateRoutePath(RoutePathes.Note));
        this.showAllButtons();
        this.store.dispatch(new UpdateNoteType(NoteType.Archive));
        break;
      }


      case '/labels' : {
        this.store.dispatch(new UpdateRoutePath(RoutePathes.Label));
        this.newButtonActive = true;
        this.selectAllActive = false;
        this.settingsActive = false;
        break;
      }
      case '/labels/deleted' : {
        this.store.dispatch(new UpdateRoutePath(RoutePathes.Label));
        this.hideAllButtons();
        break;
      }

    }
  }

  hideAllButtons() {
    this.newButtonActive = false;
    this.selectAllActive = false;
    this.settingsActive = false;
  }
  showAllButtons() {
    this.newButtonActive = true;
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
