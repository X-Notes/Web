import { Component, OnInit, HostListener } from '@angular/core';
import { PersonalizationService,
         showMenuLeftRight } from 'src/app/shared/services/personalization.service';
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
import { SelectAllFolder, UnSelectAllFolder, ArchiveFolders, ChangeColorFolder, SetDeleteFolders, RestoreFolders, DeleteFoldersPermanently, CopyFolders, MakePublicFolders, MakePrivateFolders } from '../../folders/state/folders-actions';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations: [ showMenuLeftRight ]
})
export class HeaderComponent implements OnInit {


  @Select(UserStore.getUser)
  public user$: Observable<ShortUser>;

  theme = Theme;
  routePath: RoutePathes;
  noteType: NoteType;
  folderType: FolderType;

  selectAllActive = true;
  settingsActive = true;
  sectionAdd = true;
  selected = false;

  user: number[] = [1, 2, 3, 4, 5, 6, 7, 8, ];

  constructor(public pService: PersonalizationService,
              private router: Router,
              private store: Store) { }

  ngOnInit(): void {
    this.checkRout();
  }

  showUsers() {
    this.pService.users = !this.pService.users;
  }

  hideMenu() {
    this.pService.hideInnerMenu = !this.pService.hideInnerMenu;
  }

  toggleTheme() {
    if (this.pService.theme === Theme.Light) {
      this.pService.theme = Theme.Dark;
    } else {
      this.pService.theme = Theme.Light;
    }
  }

  toggleSidebar() {
    this.pService.stateSidebar = !this.pService.stateSidebar;
  }

  cancelSelect() {
    this.selected = false;
    this.pService.newButtonActive = true;
  }

  allSelected() {
    this.selected = true;
    this.pService.newButtonActive = false;
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
        this.routePath = RoutePathes.Folder;
        this.pService.innerNote = false;
        this.selected = false;
        this.sectionAdd = true;
        this.showAllButtons();
        this.folderType = FolderType.Private;
        break;
      }
      case '/folders/shared' : {
        this.routePath = RoutePathes.Folder;
        this.showAllButtons();
        this.folderType = FolderType.Shared;
        break;
      }
      case '/folders/deleted' : {
        this.routePath = RoutePathes.Folder;
        this.showAllButtons();
        this.folderType = FolderType.Deleted;
        break;
      }
      case '/folders/archive' : {
        this.routePath = RoutePathes.Folder;
        this.showAllButtons();
        this.folderType = FolderType.Archive;
        break;
      }


      case '/notes' : {
        this.routePath = RoutePathes.Note;
        this.showAllButtons();
        this.pService.innerNote = false;
        this.selected = false;
        this.sectionAdd = true;
        this.noteType = NoteType.Private;
        break;
      }
      case '/notes/shared' : {
        this.routePath = RoutePathes.Note;
        this.showAllButtons();
        this.pService.innerNote = false;
        this.selected = false;
        this.sectionAdd = true;
        this.noteType = NoteType.Shared;
        break;
      }
      case '/notes/deleted' : {
        this.routePath = RoutePathes.Note;
        this.showAllButtons();
        this.pService.innerNote = false;
        this.selected = false;
        this.sectionAdd = true;
        this.noteType = NoteType.Deleted;
        break;
      }
      case '/notes/archive' : {
        this.routePath = RoutePathes.Note;
        this.showAllButtons();
        this.pService.innerNote = false;
        this.selected = false;
        this.sectionAdd = true;
        this.noteType = NoteType.Archive;
        break;
      }


      case '/labels' : {
        this.routePath = RoutePathes.Label;
        this.showAllButtons();
        this.selected = false;
        this.pService.innerNote = false;
        this.sectionAdd = true;
        this.settingsActive = false;
        this.selectAllActive = false;
        break;
      }
      case '/labels/deleted' : {
        this.routePath =  RoutePathes.Label;
        this.selected = false;
        this.pService.innerNote = false;
        this.sectionAdd = true;
        this.settingsActive = false;
        this.selectAllActive = false;
        this.pService.newButtonActive = false;
        break;
      }
      default : {
        this.pService.innerNote = true;
        this.selected = false;
        this.sectionAdd = false;
        this.pService.innerNote = true;
        this.pService.newButtonActive = false;
        this.routePath =  RoutePathes.Label;
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
    switch (this.routePath) {
      case RoutePathes.Folder: {
        this.store.dispatch(new SelectAllFolder(this.folderType));
        break;
      }
      case RoutePathes.Note: {
        this.store.dispatch(new SelectAllNote(this.noteType));
        break;
      }
    }
  }

  unselectAll() {
    switch (this.routePath) {
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
    this.store.dispatch(new ChangeColorNote(NoteColorPallete.BlueOne, this.noteType));
  }

  setdeleteNotes() {
    this.store.dispatch(new SetDeleteNotes(this.noteType));
  }

  deleteNotes() {
    this.store.dispatch(new DeleteNotesPermanently());
  }

  restoreNotes() {
    this.store.dispatch(new RestoreNotes());
  }

  archiveNotes() {
    this.store.dispatch(new ArchiveNotes(this.noteType));
  }

  makePublic() {
    this.store.dispatch(new MakePublicNotes(this.noteType));
  }

  makePrivate() {
    this.store.dispatch(new MakePrivateNotes(this.noteType));
  }

  copyNotes() {
    this.store.dispatch(new CopyNotes(this.noteType));
  }

  // UPPER MENU FUNCTIONS FOLDERS

  archiveFolders() {
    this.store.dispatch(new ArchiveFolders(this.folderType));
  }

  changeColorFolder() {
    this.store.dispatch(new ChangeColorFolder(NoteColorPallete.BlueOne, this.folderType));
  }

  setDeleteFolders() {
    this.store.dispatch(new SetDeleteFolders(this.folderType));
  }

  restoreFolders() {
    this.store.dispatch(new RestoreFolders());
  }

  deleteFolders() {
    this.store.dispatch(new DeleteFoldersPermanently());
  }

  copyFolders() {
    this.store.dispatch(new CopyFolders(this.folderType));
  }

  makePublicFolder() {
    this.store.dispatch(new MakePublicFolders(this.folderType));
  }

  makePrivateFolder() {
    this.store.dispatch(new MakePrivateFolders(this.folderType));
  }
}
